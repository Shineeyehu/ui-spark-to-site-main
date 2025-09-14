import { supabase } from "@/integrations/supabase/client";

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
    
    // 检查传统 token 格式
    if (this.config.accessToken && !this.config.accessToken.startsWith('cztei_')) {
      throw new Error('Token格式不正确，应以cztei_开头');
    }
    
    return this.config.accessToken;
  }

  /**
   * 发送消息到扣子智能体 (通过 edge function)
   */
  async sendMessage(message: string, conversationId?: string): Promise<CozeResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('coze-chat', {
        body: {
          message,
          conversationId: conversationId || this.config.conversationId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
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
      const { data, error } = await supabase.functions.invoke('coze-chat', {
        body: {
          birthInfo,
          conversationId: this.config.conversationId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
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
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const stream = new ReadableStream<CozeStreamResponse>({
        start(controller) {
          function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                onComplete?.();
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                      controller.close();
                      onComplete?.();
                      return;
                    }
                    
                    const parsed = JSON.parse(data);
                    const streamResponse: CozeStreamResponse = {
                      event: parsed.event || 'message',
                      data: data,
                      conversation_id: parsed.conversation_id,
                      message_id: parsed.message_id,
                      role: parsed.role,
                      content: parsed.content,
                      content_type: parsed.content_type,
                      type: parsed.type
                    };
                    
                    controller.enqueue(streamResponse);
                    onMessage?.(streamResponse);
                  } catch (e) {
                    // console.warn('Failed to parse SSE data:', line.slice(6));
                  }
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
      // console.error('流式API调用失败:', error);
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
      const token = await this.getValidToken();
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
              content: "请根据以下出生信息进行命理分析",
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
              "手相": birthInfo.palmReading || ""
            }
          },
          enable_card: false,
          publish_status: 'published_online',
          auto_save_history: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const stream = new ReadableStream<CozeStreamResponse>({
        start(controller) {
          function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                onComplete?.();
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                      controller.close();
                      onComplete?.();
                      return;
                    }
                    
                    const parsed = JSON.parse(data);
                    const streamResponse: CozeStreamResponse = {
                      event: parsed.event || 'message',
                      data: data,
                      conversation_id: parsed.conversation_id,
                      message_id: parsed.message_id,
                      role: parsed.role,
                      content: parsed.content,
                      content_type: parsed.content_type,
                      type: parsed.type
                    };
                    
                    controller.enqueue(streamResponse);
                    onMessage?.(streamResponse);
                  } catch (e) {
                    // console.warn('Failed to parse SSE data:', line.slice(6));
                  }
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
  accessToken: 'cztei_hGncDt8Pqhr7KgkB6n5AoPSqrctEedbkCsIhnbiFdNLevAAXFW72tKnYQu67TA62t',
  conversationId: undefined,
  useJWT: true
};

export default CozeAPI;
