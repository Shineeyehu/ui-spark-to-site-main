// import { supabase } from "@/integrations/supabase/client"; // 已备份到 supabase-backup 目录

export interface CozeConfig {
  botId: string;
  userId: string;
  accessToken: string;
  conversationId?: string;
  useJWT?: boolean;
  authService?: any; // JWT 认证服务
}

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
  type?: string;
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
  palmReadingFile?: File;
}

class CozeAPI {
  private config: CozeConfig;

  constructor(config: CozeConfig) {
    this.config = config;
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
    if (this.config.accessToken && !this.config.accessToken.startsWith('pat_')) {
      throw new Error('Token格式不正确，应以pat_开头');
    }
    
    return this.config.accessToken;
  }

  /**
   * 发送消息到扣子智能体 (通过 edge function)
   */
  async sendMessage(message: string, conversationId?: string): Promise<CozeResponse> {
    try {
      // 原 Supabase Edge Function 调用已注释，代码已备份到 supabase-backup 目录
      // const { data, error } = await supabase.functions.invoke('coze-chat', {
      //   body: {
      //     message,
      //     conversationId: conversationId || this.config.conversationId
      //   }
      // });
      // if (error) {
      //   throw new Error(error.message);
      // }
      // if (data?.error) {
      //   throw new Error(data.error);
      // }
      // return data;
      
      // 临时返回模拟数据，需要实现直接调用扣子API
      throw new Error('Supabase Edge Function已禁用，需要实现直接API调用');
    } catch (error) {
      // console.error('扣子 API 调用失败:', error);
      throw error;
    }
  }

  /**
   * 基于出生信息进行命理分析
   */
  async analyzeBirthInfo(birthInfo: BirthInfo): Promise<CozeResponse> {
    try {
      // 原 Supabase Edge Function 调用已注释，代码已备份到 supabase-backup 目录
      // const { data, error } = await supabase.functions.invoke('coze-chat', {
      //   body: {
      //     birthInfo,
      //     conversationId: this.config.conversationId
      //   }
      // });
      // if (error) {
      //   throw new Error(error.message);
      // }
      // if (data?.error) {
      //   throw new Error(data.error);
      // }
      // return data;
      
      // 临时返回模拟数据，需要实现直接调用扣子API
      throw new Error('Supabase Edge Function已禁用，需要实现直接API调用');
    } catch (error) {
      // console.error('扣子分析失败:', error);
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
   * 清理内容，只保留markdown报告部分
   */
  /**
   * 判断是否应该过滤掉某个数据
   */
  private shouldFilterData(data: any): boolean {
    // 过滤verbose类型的数据
    if (data.type === 'verbose') {
      return true;
    }
    
    // 过滤knowledge_recall相关数据
    if (data.content_type === 'knowledge_recall' || 
        (data.content && data.content.includes('knowledge_recall'))) {
      return true;
    }
    
    // 过滤follow_up相关数据
    if (data.content_type === 'follow_up' || 
        (data.content && data.content.includes('follow_up'))) {
      return true;
    }
    
    // 过滤工具调用相关数据
    if (data.content_type === 'tool_call' || 
        data.content_type === 'tool_response' ||
        (data.content && (data.content.includes('plugin_id') || 
                         data.content.includes('api_id') ||
                         data.content.includes('plugin_name')))) {
      return true;
    }
    
    // 过滤元数据和系统消息
    if (data.role === 'system' || 
        data.content_type === 'metadata' ||
        (data.content && data.content.startsWith('{'))) {
      return true;
    }
    
    // 过滤空内容或只包含空白字符的内容
    if (!data.content || data.content.trim().length === 0) {
      return true;
    }
    
    // 过滤只包含技术信息的内容
    const technicalKeywords = [
      'conversation_id', 'message_id', 'plugin_execution',
      'api_response', 'tool_execution', 'workflow_step'
    ];
    
    if (data.content && technicalKeywords.some(keyword => 
        data.content.includes(keyword) && data.content.length < 200)) {
      return true;
    }
    
    return false;
  }

  private cleanMarkdownContent(content: string): string {
    try {
      // 首先移除所有JSON格式的数据
      let cleanContent = content.replace(/^\s*\{[\s\S]*?\}\s*$/gm, '');
      
      // 移除技术相关的行和错误信息
      const technicalPatterns = [
        /^.*(?:plugin_id|api_id|plugin_name|plugin_type|arguments|tool_call|tool_response).*$/gm,
        /^.*(?:conversation_id|message_id|workflow_step|api_response).*$/gm,
        /^.*(?:knowledge_recall|follow_up|metadata).*$/gm,
        /^\s*```json[\s\S]*?```\s*$/gm, // 移除JSON代码块
        /^\s*\[.*\]\s*$/gm, // 移除数组格式的行
        /RPCError\{[^}]*\}/g, // 移除RPCError信息
        /BizStatusCode:\[[^\]]*\]/g, // 移除状态码
        /BizStatusMessage:\[[^\]]*\]/g, // 移除状态消息
        /PSM:\[[^\]]*\]/g, // 移除PSM信息
        /Method:\[[^\]]*\]/g, // 移除方法信息
        /ErrType:\[[^\]]*\]/g, // 移除错误类型
        /OriginalErr:\[[^\]]*\]/g, // 移除原始错误
      ];
      
      technicalPatterns.forEach(pattern => {
        cleanContent = cleanContent.replace(pattern, '');
      });
      
      // 优先查找命理报告的标志性内容
      const reportMarkers = [
        /【命主信息概览】/,
        /##\s*【命主信息概览】/,
        /核心命理分析报告/,
        /天赋挖掘与成长建议/,
        /性格特质与教养指南/,
        /玄机子大师结语/
      ];
      
      let reportStart = -1;
      for (const marker of reportMarkers) {
        reportStart = cleanContent.search(marker);
        if (reportStart !== -1) break;
      }
      
      // 如果找到了命理报告内容，从该位置开始截取
      if (reportStart !== -1) {
        cleanContent = cleanContent.substring(reportStart);
        console.log('找到命理报告内容，长度:', cleanContent.length);
      } else {
        // 如果没找到标志性内容，查找其他有意义的markdown内容
        const meaningfulStart = cleanContent.search(/(?:您好|尊敬的|根据您提供|经过分析|##\s*【|#\s*【)/);
        if (meaningfulStart !== -1) {
          cleanContent = cleanContent.substring(meaningfulStart);
        }
      }
      
      // 进一步清理内容
      cleanContent = cleanContent
        // 移除多余的空行
        .replace(/\n{3,}/g, '\n\n')
        // 移除行首行尾的空白
        .replace(/^\s+|\s+$/gm, '')
        // 移除只包含特殊字符的行
        .replace(/^[^\w\u4e00-\u9fff]*$/gm, '')
        .trim();
      
      // 检查清理后的内容是否有意义
      if (cleanContent.length < 50) {
        console.log('清理后内容过短，返回原始内容');
        return content.trim();
      }
      
      // 检查是否包含命理分析的关键词
      const keyWords = ['命主', '八字', '紫微', '性格', '天赋', '建议', '分析'];
      const hasKeyWords = keyWords.some(keyword => cleanContent.includes(keyword));
      
      if (!hasKeyWords && cleanContent.length < 200) {
        console.log('内容不包含关键词且较短，可能不是有效的命理分析');
        return '';
      }
      
      console.log('清理后的内容长度:', cleanContent.length);
      return cleanContent;
    } catch (error) {
      console.error('清理markdown内容时出错:', error);
      return content;
    }
  }

  /**
   * 上传文件到Coze
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const token = await this.getValidToken();
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://api.coze.cn/v1/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json', // 添加Accept头
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('文件上传失败:', errorText);
        throw new Error(`文件上传失败: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('文件上传成功:', result);
      
      // 根据Coze API v3响应格式调整
      if (result.data && result.data.id) {
        return result.data.id;
      } else if (result.id) {
        return result.id;
      } else {
        console.error('文件上传响应格式:', result);
        throw new Error('文件上传响应格式不正确');
      }
    } catch (error) {
      console.error('文件上传错误:', error);
      throw error;
    }
  }

  /**
   * 流式调用扣子智能体API
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
      
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000); // 120秒超时，避免30秒限制
      
      const response = await fetch('https://api.coze.cn/v3/chat?', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: this.config.botId,
          user_id: this.config.userId,
          stream: true,
          additional_messages: [
            {
              content: message,
              content_type: 'text',
              role: 'user',
              type: 'question'
            }
          ],
          parameters: {},
          enable_card: false,
          publish_status: 'published_online',
          auto_save_history: true
        }),
        signal: controller.signal
      });
      
      // 清除超时定时器
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        console.error('响应体为空');
        throw new Error('Response body is null');
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type') || '';
      console.log('响应内容类型:', contentType);
      
      if (contentType.includes('application/json')) {
        // 处理JSON响应而非流式响应
        console.log('检测到JSON响应，读取完整内容...');
        const jsonResponse = await response.json();
        console.log('JSON响应内容:', jsonResponse);
        
        // 如果是JSON响应，我们需要模拟流式处理
        if (jsonResponse.messages && jsonResponse.messages.length > 0) {
          const message = jsonResponse.messages[jsonResponse.messages.length - 1];
          const streamResponse: CozeStreamResponse = {
            event: 'message',
            data: JSON.stringify(message),
            conversation_id: jsonResponse.conversation_id,
            message_id: message.id,
            role: message.role,
            content: message.content,
            content_type: message.content_type,
            type: message.type
          };
          
          // 立即调用回调
          onMessage?.(streamResponse);
          onComplete?.();
          
          // 返回一个简单的流
          return new ReadableStream<CozeStreamResponse>({
            start(controller) {
              controller.enqueue(streamResponse);
              controller.close();
            }
          });
        } else {
          throw new Error('JSON响应中没有找到消息内容');
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      console.log('开始读取流式响应...');

      let buffer = ''; // 用于缓存不完整的数据
      let currentEvent = 'conversation.message.delta'; // 默认事件类型

      const stream = new ReadableStream<CozeStreamResponse>({
        start(controller) {
          function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
              if (done) {
                console.log('流式响应结束');
                // 处理缓冲区中剩余的数据
                if (buffer.trim()) {
                  console.log('处理缓冲区剩余数据:', buffer);
                  processBufferedData(buffer, controller);
                }
                controller.close();
                onComplete?.();
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              console.log('接收到数据块:', chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''));
              
              // 将新数据添加到缓冲区
              buffer += chunk;
              
              // 按行分割，保留最后一个可能不完整的行
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

              for (const line of lines) {
                processSSELine(line, controller);
              }

              return pump();
            });
          }

          function processSSELine(line: string, controller: ReadableStreamDefaultController<CozeStreamResponse>) {
            console.log('处理行:', line);
            // 处理标准SSE格式：data:开头的行（注意没有空格）
            if (line.startsWith('data:')) {
              try {
                const data = line.slice(5).trim(); // 移除'data:'前缀并去除空白
                console.log('提取的数据:', data);
                
                if (data === '[DONE]') {
                  console.log('收到结束标记');
                  controller.close();
                  onComplete?.();
                  return;
                }
                
                // 检查数据是否为空或无效
                if (!data || data === '') {
                  console.log('跳过空数据行');
                  return;
                }
                
                const parsed = JSON.parse(data);
                console.log('解析的数据:', parsed);
                
                // 验证解析的数据结构
                if (!parsed || typeof parsed !== 'object') {
                  console.warn('解析的数据格式无效:', parsed);
                  return;
                }
                
                const streamResponse: CozeStreamResponse = {
                  event: currentEvent,
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
                console.warn('解析SSE数据失败，跳过此行:', line.slice(5), e);
                // 不中断整个流程，继续处理下一行
              }
            } else if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim(); // 更新当前事件类型
              console.log('事件类型:', currentEvent);
            } else if (line.trim()) {
              console.log('其他行:', line);
            }
          }

          function processBufferedData(data: string, controller: ReadableStreamDefaultController<CozeStreamResponse>) {
            const lines = data.split('\n');
            for (const line of lines) {
              if (line.trim()) {
                processSSELine(line, controller);
              }
            }
          }

          return pump();
        }
      });

      return stream;
    } catch (error) {
      console.error('API调用失败:', error);
      console.error('错误详情:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      onError?.(error as Error);
      return null;
    }
  }

  /**
   * 基于出生信息进行流式命理分析
   */
  async streamBirthAnalysis(
    birthInfo: BirthInfo,
    onMessage?: (data: CozeStreamResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<ReadableStream<CozeStreamResponse> | null> {
    try {
      console.log('开始扣子API调用，获取token...');
      const token = await this.getValidToken();
      console.log('Token获取成功，长度:', token.length);
      
      // 如果有手相文件，先上传文件
      let palmReadingFileId = '';
      let palmReadingText = '';
      if (birthInfo.palmReadingFile) {
        console.log('检测到手相文件，开始上传...');
        try {
          palmReadingFileId = await this.uploadFile(birthInfo.palmReadingFile);
          console.log('手相文件上传成功，文件ID:', palmReadingFileId);
          palmReadingText = `已上传手相照片，文件ID: ${palmReadingFileId}`;
        } catch (uploadError) {
          console.error('手相文件上传失败:', uploadError);
          // 文件上传失败时，继续进行基础命理分析，但不包含手相部分
          palmReadingText = '手相文件上传失败，将基于生辰八字进行基础命理分析。建议稍后重新上传清晰的手相照片以获得完整分析。';
          console.log('手相文件上传失败，继续进行基础命理分析');
        }
      } else if (birthInfo.palmReading) {
        // 如果没有文件但有文件名，说明是旧的数据格式，提示用户重新上传
        palmReadingText = '请重新上传手相照片文件，而非文件名。当前将基于生辰八字进行基础分析。';
        console.log('检测到文件名而非文件对象，继续进行基础分析');
      }
      
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('API调用超时，中止请求');
        controller.abort();
      }, 120000); // 120秒超时，避免30秒限制
      
      // 构建详细的出生信息消息
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
${palmReadingText || '未提供'}

请根据以上信息，进行"天地双盘+手相，参合互证"的深度分析，提供详细的命理分析报告，包括：
1. 命主信息概览
2. 核心命理分析报告
3. 天赋挖掘与成长建议
4. 玄机子大师结语`;

      const requestBody = {
        bot_id: this.config.botId,
        user_id: this.config.userId,
        stream: true,
        additional_messages: [
          {
            content: detailedMessage,
            content_type: 'text',
            role: 'user',
            type: 'question'
          }
        ],
        parameters: {},
        shortcut_command: {
          command_id: "7547965462022242314",
          parameters: {
            "性别": birthInfo.gender === 'male' ? '男' : '女',
            "出生日期": birthInfo.birthDate,
            "公历or农历": birthInfo.calendar === 'solar' ? '公历' : '农历',
            "出生时间": birthInfo.birthTime,
            "是否为闰月": birthInfo.isLeapMonth === 'true' ? '是' : '否',
            "出生地": birthInfo.birthPlace,
            "出生环境": birthInfo.birthEnvironment,
            "年龄": birthInfo.age || "",
            "手相": palmReadingFileId ? JSON.stringify({"file_id": palmReadingFileId}) : ""
          }
        },
        enable_card: false,
        publish_status: 'published_online',
        auto_save_history: true
      };
      
      console.log('发送API请求，请求体:', JSON.stringify(requestBody, null, 2));
      
      // 调试token信息
      console.log('使用的token:', token);
      console.log('token长度:', token.length);
      console.log('token前缀:', token.substring(0, 10));
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CozeAPI/1.0'
      };
      
      console.log('请求头:', headers);
      
      const response = await fetch('https://api.coze.cn/v3/chat?', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      console.log('API响应状态:', response.status, response.statusText);
      console.log('响应头:', Object.fromEntries(response.headers.entries()));
      console.log('响应体是否存在:', !!response.body);
      
      // 清除超时定时器
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP错误响应内容:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      if (!response.body) {
        console.error('响应体为空');
        throw new Error('Response body is null');
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type') || '';
      console.log('响应内容类型:', contentType);

      // 如果是JSON响应而不是流式响应，直接处理
      if (contentType.includes('application/json')) {
        console.log('检测到JSON响应，读取完整内容...');
        const jsonText = await response.text();
        console.log('JSON响应内容:', jsonText);
        
        try {
          const jsonData = JSON.parse(jsonText);
          console.log('解析的JSON数据:', jsonData);
          
          // 模拟流式处理，直接调用回调
          if (onMessage && jsonData) {
            // 智能提取内容：优先使用data字段，然后是content字段，最后才是原始JSON
            let extractedContent = '';
            if (jsonData.data && typeof jsonData.data === 'string') {
              extractedContent = jsonData.data;
            } else if (jsonData.content && typeof jsonData.content === 'string') {
              extractedContent = jsonData.content;
            } else if (jsonData.wrapped_text && typeof jsonData.wrapped_text === 'string') {
              extractedContent = jsonData.wrapped_text;
            } else {
              // 如果都没有，尝试提取所有字符串值
              const stringValues = Object.values(jsonData).filter(value => 
                typeof value === 'string' && value.length > 10
              );
              extractedContent = stringValues.length > 0 ? stringValues[0] : jsonText;
            }
            
            // 清理内容，只保留markdown报告部分
            const cleanedContent = this.cleanMarkdownContent(extractedContent);
            
            onMessage({
              event: 'message',
              data: jsonText,
              content: cleanedContent,
              role: 'assistant',
              type: 'text'
            });
          }
          
          if (onComplete) {
            onComplete();
          }
          
          return null; // 不返回流，因为已经处理完成
        } catch (parseError) {
          console.error('JSON解析错误:', parseError);
          if (onError) {
            onError(new Error(`JSON解析失败: ${parseError}`));
          }
          return null;
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      console.log('开始读取流式响应...');

      let buffer = ''; // 用于缓存不完整的数据
      let currentEvent = 'conversation.message.delta'; // 默认事件类型
      const self = this; // 保存this引用

              const stream = new ReadableStream<CozeStreamResponse>({
        start(controller) {
          function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
              if (done) {
                console.log('流式响应读取完成');
                // 处理缓冲区中剩余的数据
                if (buffer.trim()) {
                  console.log('处理缓冲区剩余数据:', buffer);
                  processBufferedData(buffer, controller);
                }
                controller.close();
                onComplete?.();
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              console.log('接收到数据块:', chunk);
              
              // 将新数据添加到缓冲区
              buffer += chunk;
              
              // 按行分割，保留最后一个可能不完整的行
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // 保留最后一行（可能不完整）
              
              console.log('处理完整行数:', lines.length, '缓冲区剩余:', buffer.length);

              for (const line of lines) {
                processSSELine(line, controller);
              }

              return pump();
            });
          }

          function processSSELine(line: string, controller: ReadableStreamDefaultController<CozeStreamResponse>) {
            console.log('处理行:', line);
            // 处理标准SSE格式：data:开头的行（注意没有空格）
            if (line.startsWith('data:')) {
              try {
                const data = line.slice(5).trim(); // 移除'data:'前缀并去除空白
                console.log('提取的数据:', data);
                
                if (data === '[DONE]') {
                  console.log('收到结束标记');
                  controller.close();
                  onComplete?.();
                  return;
                }
                
                // 检查数据是否为空或无效
                if (!data || data === '') {
                  console.log('跳过空数据行');
                  return;
                }
                
                const parsed = JSON.parse(data);
                console.log('解析的数据:', parsed);
                
                // 验证解析的数据结构
                if (!parsed || typeof parsed !== 'object') {
                  console.warn('解析的数据格式无效:', parsed);
                  return;
                }
                
                // 强化数据过滤逻辑 - 过滤无用信息
                if (self.shouldFilterData(parsed)) {
                  console.log('过滤掉无用数据:', parsed.type || parsed.content_type);
                  return;
                }
                
                // 清理内容，只保留markdown报告部分
                const cleanedContent = parsed.content ? self.cleanMarkdownContent(parsed.content) : parsed.content;
                
                // 如果清理后内容为空或过短，跳过
                if (!cleanedContent || cleanedContent.trim().length < 10) {
                  console.log('跳过空或过短的内容');
                  return;
                }
                
                const streamResponse: CozeStreamResponse = {
                  event: currentEvent,
                  data: data,
                  conversation_id: parsed.conversation_id,
                  message_id: parsed.id,
                  role: parsed.role,
                  content: cleanedContent,
                  content_type: parsed.content_type,
                  type: parsed.type
                };
                
                console.log('构造的流响应:', streamResponse);
                controller.enqueue(streamResponse);
                onMessage?.(streamResponse);
              } catch (e) {
                console.warn('解析SSE数据失败，跳过此行:', line.slice(5), e);
                // 不中断整个流程，继续处理下一行
              }
            } else if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim(); // 更新当前事件类型
              console.log('事件类型:', currentEvent);
            } else if (line.trim()) {
              console.log('其他行:', line);
            }
          }

          function processBufferedData(data: string, controller: ReadableStreamDefaultController<CozeStreamResponse>) {
            const lines = data.split('\n');
            for (const line of lines) {
              if (line.trim()) {
                processSSELine(line, controller);
              }
            }
          }

          return pump();
        }
      });

      return stream;
    } catch (error) {
      // console.error('流式命理分析失败:', error);
      onError?.(error as Error);
      return null;
    }
  }
}

// 创建默认的扣子 API 实例
export const createCozeAPI = (config: CozeConfig) => new CozeAPI(config);

// 默认配置
export const defaultCozeConfig: CozeConfig = {
  botId: '7546564367413379135',
  userId: '123456789',
  accessToken: 'pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS', // 使用用户提供的有效PAT token
  conversationId: undefined,
  useJWT: false // 暂时禁用JWT认证，使用静态token
};

export default CozeAPI;
