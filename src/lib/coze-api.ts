// import { supabase } from "@/integrations/supabase/client"; // 已备份到 supabase-backup 目录

export interface CozeMessage {
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image';
}

export interface CozeResponse {
  messages: CozeMessage[];
  conversation_id: string;
  code: number;
  msg: string;
}

export interface CozeStreamResponse {
  event: string;
  data: string;
  conversation_id?: string;
  message_id?: string;
  role?: string;
  content?: string;
  content_type?: string;
  type?: string | 'mixed_data' | 'json_report' | 'rpc_error' | 'keyword_memory';
}

export interface BirthInfo {
  gender: string;
  calendar: string;
  birthDate: string;
  birthTime: string;
  isLeapMonth?: string;
  birthPlace: string;
  birthEnvironment: string;
  age?: string;
  palmReading?: string;
  palmReadingFile?: string; // base64格式的图片文件
}

import { 
  getCozeConfig, 
  getCozeConfigSecure, 
  validateCozeConfig, 
  generateSessionId,
  generateUserId,
  getApiEndpoint,
  type CozeConfig 
} from './coze-config';

class CozeAPI {
  private config: CozeConfig;
  private sessionId: string;

  constructor(config?: Partial<CozeConfig>) {
    // 合并默认配置和传入的配置
    const defaultConfig = getCozeConfig();
    this.config = { ...defaultConfig, ...config };
    
    // 验证配置
    const validation = validateCozeConfig(this.config);
    if (!validation.isValid) {
      console.warn('Coze配置不完整，缺少字段:', validation.missingFields);
    }
    
    this.sessionId = generateSessionId();
    
    console.log('CozeAPI初始化完成:', {
      botId: this.config.botId,
      userId: this.config.userId,
      apiVersion: this.config.apiVersion,
      baseUrl: this.config.baseUrl,
      streamEnabled: this.config.streamEnabled,
      sessionId: this.sessionId
    });
  }

  /**
   * 获取有效的访问令牌
   */
  private async getValidToken(): Promise<string> {
    if (this.config.useJWT && this.config.authService) {
      try {
        return await this.config.authService.getValidToken();
      } catch (error) {
        console.error('JWT token获取失败:', error);
        throw new Error('JWT token获取失败，请重新授权');
      }
    }
    
    // 检查 PAT token 格式
    if (this.config.token && !this.config.token.startsWith('pat_')) {
      throw new Error('Token格式不正确，应以pat_开头');
    }
    
    return this.config.token;
  }

  /**
   * 发送消息到扣子智能体
   */
  async sendMessage(message: string, conversationId?: string): Promise<CozeResponse> {
    try {
      // 使用 Supabase Edge Function 调用 Coze API
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );

      const { data, error } = await supabase.functions.invoke('coze-chat', {
        body: { 
          message, 
          conversationId,
          birthInfo: null // 如果需要出生信息分析，可以传入相应数据
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`API调用失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  /**
   * 基于出生信息进行命理分析
   */
  async analyzeBirthInfo(birthInfo: BirthInfo): Promise<CozeResponse> {
    try {
      // 使用 Supabase Edge Function 调用 Coze API
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );

      const { data, error } = await supabase.functions.invoke('coze-chat', {
        body: { 
          birthInfo,
          message: null, // 出生信息分析不需要额外消息
          conversationId: null
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`分析失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('分析出生信息失败:', error);
      throw error;
    }
  }

  /**
   * 创建新的对话会话
   */
  async createConversation(): Promise<string> {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 流式调用扣子智能体API
   */
  /**
   * 流式聊天 - 重新实现以正确处理Coze API v3的SSE响应
   */
  async streamChat(
    message: string,
    conversationId?: string,
    onMessage?: (data: CozeStreamResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<ReadableStream<CozeStreamResponse> | null> {
    try {
      const token = await this.getValidToken();
      
      console.log('开始流式聊天请求:', {
        botId: this.config.botId,
        userId: this.config.userId,
        messageLength: message.length,
        conversationId,
        streamEnabled: this.config.streamEnabled
      });
      
      // 创建 AbortController 用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('请求超时，中止连接...');
        controller.abort();
      }, this.config.timeout || 300000); // 使用配置中的超时时间
      
      const requestBody = {
        bot_id: this.config.botId,
        user_id: this.config.userId,
        stream: this.config.streamEnabled !== false, // 使用配置中的流式设置
        auto_save_history: true,
        additional_messages: [
          {
            role: 'user',
            content: message,
            content_type: 'text'
          }
        ]
      };

      // 使用配置中的API端点
      const endpoint = conversationId 
        ? `chat?conversation_id=${conversationId}`
        : 'chat';
      const url = getApiEndpoint(this.config, endpoint);

      console.log('发送请求到:', url);
      console.log('请求体:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      // 清除超时定时器
      clearTimeout(timeoutId);

      console.log('响应状态:', response.status);
      console.log('响应头:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API调用失败:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type') || '';
      console.log('响应内容类型:', contentType);
      
      // 如果不是流式响应，处理JSON响应
      if (!contentType.includes('text/event-stream') && contentType.includes('application/json')) {
        console.log('检测到JSON响应，读取完整内容...');
        const jsonResponse = await response.json();
        console.log('JSON响应内容:', jsonResponse);
        
        if (jsonResponse.data && jsonResponse.data.id) {
          // 这是非流式响应，需要轮询获取结果
          const chatId = jsonResponse.data.id;
          const convId = jsonResponse.data.conversation_id;
          
          console.log('非流式响应，开始轮询结果:', { chatId, convId });
          
          // 返回一个模拟的流，用于轮询结果
          return this.createPollingStream(convId, chatId, onMessage, onError, onComplete);
        } else {
          throw new Error('JSON响应格式不正确');
        }
      }

      // 处理真正的流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      console.log('开始读取SSE流式响应...');

      const stream = new ReadableStream<CozeStreamResponse>({
        start(controller) {
          let buffer = '';
          
          function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
              if (done) {
                console.log('流式响应结束');
                controller.close();
                onComplete?.();
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;
              
              // 按行分割处理SSE数据
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // 保留最后一个可能不完整的行
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (trimmedLine.startsWith('data: ')) {
                  const data = trimmedLine.slice(6); // 移除'data: '前缀
                  
                  console.log('接收到SSE数据:', data);
                  
                  // 检查是否是结束标记
                  if (data === '[DONE]') {
                    console.log('收到结束标记 [DONE]');
                    controller.close();
                    onComplete?.();
                    return;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    console.log('解析的SSE数据:', parsed);
                    
                    // 构造标准的流响应格式
                    const streamResponse: CozeStreamResponse = {
                      event: parsed.event || 'message',
                      data: data,
                      conversation_id: parsed.conversation_id,
                      message_id: parsed.id,
                      role: parsed.role,
                      content: parsed.content || '',
                      content_type: parsed.content_type,
                      type: parsed.type
                    };
                    
                    console.log('构造的流响应:', streamResponse);
                    controller.enqueue(streamResponse);
                    onMessage?.(streamResponse);
                    
                  } catch (e) {
                    console.warn('解析SSE数据失败:', data, e);
                  }
                } else if (trimmedLine.startsWith('event: ')) {
                  console.log('事件类型:', trimmedLine);
                } else if (trimmedLine && trimmedLine !== '') {
                  console.log('其他SSE行:', trimmedLine);
                }
              }

              return pump();
            });
          }

          return pump();
        }
      });

      return stream;
    } catch (error) {
      console.error('流式API调用失败:', error);
      onError?.(error as Error);
      return null;
    }
  }

  /**
   * 创建轮询流 - 用于处理非流式响应的情况
   */
  private async createPollingStream(
    conversationId: string,
    chatId: string,
    onMessage?: (data: CozeStreamResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<ReadableStream<CozeStreamResponse>> {
    const token = await this.getValidToken();
    const maxRetries = this.config.maxRetries || 30;
    const pollInterval = this.config.pollInterval || 2000;
    
    return new ReadableStream<CozeStreamResponse>({
      async start(controller) {
        for (let i = 0; i < maxRetries; i++) {
          try {
            // 查询对话状态
            const statusUrl = getApiEndpoint(this.config, `chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`);
            const statusResponse = await fetch(statusUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              console.log('轮询状态:', statusData);
              
              if (statusData.data?.status === 'completed') {
                // 获取消息列表
                const messagesUrl = getApiEndpoint(this.config, `chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`);
                const messagesResponse = await fetch(messagesUrl, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json();
                  console.log('获取到消息:', messagesData);
                  
                  // 处理消息并发送给回调
                  if (messagesData.data && Array.isArray(messagesData.data)) {
                    for (const message of messagesData.data) {
                      if (message.role === 'assistant' && message.content) {
                        const streamResponse: CozeStreamResponse = {
                          event: 'conversation.message.completed',
                          data: JSON.stringify(message),
                          conversation_id: conversationId,
                          message_id: message.id,
                          role: message.role,
                          content: message.content,
                          content_type: message.content_type,
                          type: message.type
                        };
                        
                        controller.enqueue(streamResponse);
                        onMessage?.(streamResponse);
                      }
                    }
                  }
                }
                
                controller.close();
                onComplete?.();
                return;
              } else if (statusData.data?.status === 'failed') {
                const error = new Error('对话处理失败');
                onError?.(error);
                controller.error(error);
                return;
              }
            }
            
            // 等待下次轮询
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            
          } catch (error) {
            console.error('轮询过程中出错:', error);
            if (i === maxRetries - 1) {
              onError?.(error as Error);
              controller.error(error);
              return;
            }
          }
        }
        
        // 超过最大重试次数
        const timeoutError = new Error('轮询超时，对话可能仍在处理中');
        onError?.(timeoutError);
        controller.error(timeoutError);
      }
    });
  }

  /**
   * 流式命理分析 - 直接使用智能体聊天API
   */
  async streamBirthAnalysis(
    birthInfo: BirthInfo,
    onMessage?: (data: CozeStreamResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<ReadableStream<CozeStreamResponse> | null> {
    try {
      const token = await this.getValidToken();
      
      // 设置超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        onError?.(new Error('请求超时'));
      }, 120000); // 2分钟超时

      const detailedMessage = `请为这个孩子进行详细的命理分析：

**基本信息：**
- 性别：${birthInfo.gender === 'male' ? '男' : '女'}
- 出生日期：${birthInfo.birthDate}（${birthInfo.calendar === 'solar' ? '公历' : '农历'}）
- 出生时间：${birthInfo.birthTime}
- 是否闰月：${birthInfo.isLeapMonth === 'true' ? '是' : '否'}
- 出生地点：${birthInfo.birthPlace}
- 年龄：${birthInfo.age || '未提供'}

**环境信息：**
${birthInfo.birthEnvironment}

**手相信息：**
${birthInfo.palmReading || '未提供'}

请根据以上信息，进行"天地双盘+手相，参合互证"的深度分析，提供详细的命理分析报告，包括：
1. 命主信息概览
2. 核心命理分析报告
3. 天赋挖掘与成长建议
4. 玄机子大师结语`;

      // 直接使用智能体聊天API进行流式请求
      const requestBody = {
        bot_id: this.config.botId,
        user_id: this.config.userId,
        stream: true,
        auto_save_history: true,
        additional_messages: [
          {
            role: 'user',
            content: detailedMessage,
            content_type: 'text'
          }
        ],
        parameters: {},
        enable_card: false,
        publish_status: 'published_online'
      };

      // 如果有手相图片，添加图片消息
      if (birthInfo.palmReadingFile) {
        // 确保base64格式正确
        let imageData = birthInfo.palmReadingFile;
        if (!imageData.startsWith('data:image/')) {
          imageData = `data:image/jpeg;base64,${imageData}`;
        }
        
        requestBody.additional_messages.push({
          role: 'user',
          content: [
            {
              type: 'image',
              image_url: {
                url: imageData
              }
            }
          ],
          content_type: 'object_string'
        });
      }
      
      console.log('发送智能体聊天API流式请求，请求体:', JSON.stringify(requestBody, null, 2));
      
      // 流式请求头 (移除Cache-Control以避免CORS错误)
      const streamHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      };
      
      console.log('流式请求头:', streamHeaders);
      
      const response = await fetch('https://api.coze.cn/v3/chat', {
        method: 'POST',
        headers: streamHeaders,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      console.log('流式响应状态:', response.status, response.statusText);
      console.log('流式响应头:', Object.fromEntries(response.headers.entries()));
      console.log('响应体是否存在:', !!response.body);
      
      // 清除超时定时器
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('智能体聊天API请求失败:', response.status, errorText);
        throw new Error(`智能体聊天API请求失败: ${response.status} ${errorText}`);
      }

      if (!response.body) {
        console.error('响应体为空');
        throw new Error('Response body is null');
      }

      // 验证流式响应
      const contentType = response.headers.get('content-type');
      console.log('流式响应Content-Type:', contentType);
      
      if (!contentType?.includes('text/event-stream')) {
        console.warn('响应不是流式格式，尝试解析为JSON');
        try {
          const data = await response.json();
          console.log('非流式响应数据:', data);
          
          // 模拟流式处理，调用回调函数
          if (onMessage && data) {
            let content = '';
            if (data.messages && data.messages.length > 0) {
              content = data.messages[0].content || '';
            } else if (data.content) {
              content = data.content;
            } else if (data.data) {
              content = data.data;
            }
            
            onMessage({
              event: 'conversation.message.delta',
              data: JSON.stringify(data),
              content: content,
              role: 'assistant',
              type: 'text'
            });
          }
          
          if (onComplete) {
            onComplete();
          }
          
          return null;
        } catch (parseError) {
          console.error('JSON解析错误:', parseError);
          throw new Error('响应格式错误，无法解析');
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      console.log('开始读取流式响应...');

      const stream = new ReadableStream<CozeStreamResponse>({
        start(controller) {
          function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
              if (done) {
                console.log('流式响应读取完成');
                controller.close();
                onComplete?.();
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              console.log('接收到数据块:', chunk);
              const lines = chunk.split('\n');
              console.log('分割后的行数:', lines.length);

              for (const line of lines) {
                console.log('处理行:', line);
                // 处理标准SSE格式：data:开头的行（注意没有空格）
                if (line.startsWith('data:')) {
                  try {
                    const data = line.slice(5); // 移除'data:'前缀
                    console.log('提取的数据:', data);
                    if (data === '[DONE]') {
                      console.log('收到结束标记');
                      controller.close();
                      onComplete?.();
                      return;
                    }
                    
                    const parsed = JSON.parse(data);
                    console.log('解析的数据:', parsed);
                    const streamResponse: CozeStreamResponse = {
                      event: 'conversation.message.delta',
                      data: data,
                      conversation_id: parsed.conversation_id,
                      message_id: parsed.id,
                      role: parsed.role,
                      content: parsed.content,
                      content_type: parsed.content_type,
                      type: parsed.type
                    };
                    
                    console.log('构造的流响应:', streamResponse);
                    controller.enqueue(streamResponse);
                    onMessage?.(streamResponse);
                  } catch (e) {
                    console.warn('解析SSE数据失败:', line.slice(5), e);
                  }
                } else if (line.startsWith('event:')) {
                  console.log('事件类型:', line);
                } else if (line.trim()) {
                  console.log('其他行:', line);
                }
              }

              return pump();
            });
          }

          return pump();
        }
      });

      return stream;
    } catch (error) {
      console.error('流式命理分析失败:', error);
      
      // 增强错误处理，提供更详细的错误信息
      let errorMessage = '分析失败，请稍后重试';
      
      if (error instanceof Error) {
        const errorText = error.message;
        
        // 检查是否是文件转换错误
        if (errorText.includes("can't convert to file")) {
          errorMessage = '图片文件格式不正确，请重新上传清晰的手相照片';
        } else if (errorText.includes('请求参数不合法')) {
          errorMessage = '请求参数有误，请检查输入信息';
        } else if (errorText.includes('workflow failed')) {
          errorMessage = '分析服务暂时不可用，请稍后重试';
        } else if (errorText.includes('RPC')) {
          errorMessage = '网络连接异常，请检查网络后重试';
        } else if (errorText.includes('401') || errorText.includes('Unauthorized')) {
          errorMessage = '认证失败，请联系管理员';
        } else if (errorText.includes('403') || errorText.includes('Forbidden')) {
          errorMessage = '访问权限不足，请联系管理员';
        } else if (errorText.includes('429') || errorText.includes('Too Many Requests')) {
          errorMessage = '请求过于频繁，请稍后重试';
        } else if (errorText.includes('500') || errorText.includes('Internal Server Error')) {
          errorMessage = '服务器内部错误，请稍后重试';
        }
        
        // 创建增强的错误对象
        const enhancedError = new Error(errorMessage);
        enhancedError.name = 'CozeAPIError';
        (enhancedError as any).originalError = error;
        
        onError?.(enhancedError);
      } else {
        onError?.(new Error(errorMessage));
      }
      
      return null;
    }
  }
}

// 创建默认的扣子 API 实例
export const createCozeAPI = (config: CozeConfig) => new CozeAPI(config);

// 默认配置
export const defaultCozeConfig: CozeConfig = {
  botId: '7546564367413379135',
  token: 'pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS', // 使用正确的PAT格式token
  userId: '123456789',
  nickname: '用户',
  useJWT: false, // 暂时禁用JWT认证，使用静态token
  apiVersion: 'v3',
  baseUrl: 'https://api.coze.cn',
  streamEnabled: true,
  timeout: 300000,
  maxRetries: 30,
  pollInterval: 2000
};

// 同时提供命名导出和默认导出
export { CozeAPI };
export default CozeAPI;
