// Moonshot API 配置和调用函数

export interface MoonshotConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface MoonshotMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MoonshotResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MoonshotStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
}

// 默认配置
export const defaultMoonshotConfig: MoonshotConfig = {
  apiKey: import.meta.env.VITE_MOONSHOT_API_KEY || 'sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e',
  model: import.meta.env.VITE_MOONSHOT_MODEL || 'kimi-k2-0905-preview',
  baseUrl: import.meta.env.VITE_MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1'
};

class MoonshotAPI {
  private config: MoonshotConfig;

  constructor(config: MoonshotConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('Moonshot API Key 未配置');
    }
    if (!this.config.model) {
      throw new Error('Moonshot Model 未配置');
    }
    if (!this.config.baseUrl) {
      throw new Error('Moonshot Base URL 未配置');
    }
  }

  /**
   * 从prompt.txt文件读取系统提示词
   */
  private async loadSystemPrompt(): Promise<string> {
    try {
      const response = await fetch('/prompt.txt');
      if (!response.ok) {
        throw new Error(`Failed to load prompt: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      // console.error('Error loading system prompt:', error);
      // 如果无法加载文件，返回默认提示词
      return `# 角色
你是一位融合了顶尖信息架构师洞察力、资深教育设计师规划能力和世界级视觉设计师审美眼光的AI知识卡设计大师。你的核心任务是接收任意类型的源文档，通过结构化的两阶段协作流程，将其转化为一张视觉精美、信息密度适中、版面布局合理且内容自适应高度的单文件HTML格式知识卡。

## 技能
### 第一阶段：蓝图分析与设计规范构建
1. 接收到源文档后，输出详尽的《知识卡设计规范与内容大纲》。
2. 智能解构：将源文档拆解重组为独立完整的知识点。
3. 卡片数量决策：根据内容量控制，确定仅生成一张卡片，确保卡片内容能被优雅地展示，去除冗余信息，合理分配内容，使信息量适中。

### 第二阶段：卡片精细化设计与HTML生成
1. 重要规则：每次响应只输出一个HTML文件，文件内所有内容必须完整可见。
2. 核心原则：不使用滚动条、折叠或任何隐藏内容的方式。内容过多时，无需拆分到下一张卡片，需在一张卡片内合理布局展示。

## 输出标准
1. 严格遵循第一阶段确定的设计规范。
2. 生成一张内容自适应高度的卡片，所有内容必须完整可见且布局均衡。
3. 严格执行单卡输出：每次响应只生成一个完整的HTML知识卡。
4. 代码规范：结构清晰、语义化、CDN链接完整。
5. 视觉品质：达到专业教育设计师水准，清晰、美观、易读。
6. 信息精炼：只保留最核心知识点，合理布局展示相关内容。
7. 绝对禁止：滚动条、折叠内容、溢出隐藏等任何形式的内容隐藏。

## 限制
1. 只专注于知识卡设计相关任务，拒绝回答无关话题。
2. 所输出的内容必须按照给定的规范进行组织，不能偏离要求。
3. 在输出HTML代码时，禁止使用代码块标记符号`;
    }
  }

  /**
   * 重试机制
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 2,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 如果是网络错误或超时错误，进行重试
        if (error instanceof Error && 
            (error.message.includes('timeout') || 
             error.message.includes('network') ||
             error.message.includes('fetch'))) {
          console.warn(`请求失败，${delay}ms后进行第${attempt + 1}次重试:`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          continue;
        }
        
        throw error;
      }
    }
    throw new Error('重试次数已用完');
  }

  /**
   * 调用Moonshot API生成知识卡HTML
   */
  async generateKnowledgeCard(
    content: string,
    onMessage?: (content: string) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<string> {
    return this.retryRequest(async () => {
      try {
        const systemPrompt = await this.loadSystemPrompt();

      const messages: MoonshotMessage[] = [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: content
          }
        ];

      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 增加到180秒超时

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: 0.6,
          max_tokens: 32768,
          top_p: 1,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MoonshotResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        onComplete?.();
        return content;
      } else {
        throw new Error('No content generated');
      }
      } catch (error) {
        // console.error('Moonshot API调用失败:', error);
        onError?.(error as Error);
        throw error;
      }
    }, 2, 1000);
  }

  /**
   * 流式调用Moonshot API
   */
  async generateKnowledgeCardStream(
    content: string,
    onChunk?: (chunk: string) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<ReadableStream<string> | null> {
    try {
      return await this.retryRequest(async () => {
        const systemPrompt = await this.loadSystemPrompt();

        const messages: MoonshotMessage[] = [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: content
          }
        ];

        // 创建AbortController用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 流式请求增加到300秒超时

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: messages,
            temperature: 0.6,
            max_tokens: 32768,
            top_p: 1,
            stream: true
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream<string>({
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
                      if (parsed.choices && parsed.choices[0]?.delta?.content) {
                        const content = parsed.choices[0].delta.content;
                        controller.enqueue(content);
                        onChunk?.(content);
                      }
                    } catch (e) {
                      // console.warn('Failed to parse SSE data:', line);
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
      }, 2, 1000);
    } catch (error) {
      onError?.(error as Error);
      return null;
    }
  }
}

// 创建默认的Moonshot API实例
export const createMoonshotAPI = (config: MoonshotConfig) => new MoonshotAPI(config);

export default MoonshotAPI;
