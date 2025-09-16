/**
 * 扣子混合数据提取器
 * 处理包含JSON和Markdown混合格式的扣子API响应
 */

import { MarkdownProcessor, ProcessedMarkdown } from './markdown-processor';

export interface CozeApiCall {
  name: string;
  arguments: Record<string, any>;
  plugin_id?: number;
  plugin_name?: string;
  api_id?: number;
  api_name?: string;
  plugin_type?: number;
  plugin?: string;
}

export interface CozeApiResponse {
  [key: string]: any;
}

export interface CozeErrorResponse {
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface ExtractedCozeData {
  apiCalls: CozeApiCall[];
  apiResponses: CozeApiResponse[];
  errors: CozeErrorResponse[];
  markdownContent: string;
  processedMarkdown?: ProcessedMarkdown;
  rawData: string;
}

export class CozeMixedDataExtractor {
  private markdownProcessor: MarkdownProcessor;

  constructor() {
    this.markdownProcessor = new MarkdownProcessor();
  }

  /**
   * 从响应中提取混合数据（别名方法，保持向后兼容）
   */
  extractFromResponse(rawResponse: string): ExtractedCozeData {
    return this.extractMixedData(rawResponse);
  }

  /**
   * 从响应中提取混合数据
   */
  extractMixedData(rawResponse: string): ExtractedCozeData {
    const apiCalls: CozeApiCall[] = [];
    const apiResponses: CozeApiResponse[] = [];
    const errors: CozeErrorResponse[] = [];
    let markdownContent = '';
    let processedMarkdown: ProcessedMarkdown | undefined;

    try {
      // 分割数据，寻找JSON对象和markdown内容
      const parts = this.splitMixedData(rawResponse);
      
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        if (this.isJsonLike(trimmedPart)) {
          try {
            const jsonData = JSON.parse(trimmedPart);
            this.categorizeJsonData(jsonData, apiCalls, apiResponses, errors);
          } catch (e) {
            // 如果JSON解析失败，可能是markdown内容
            if (this.isMarkdownLike(trimmedPart)) {
              markdownContent += trimmedPart + '\n';
            }
          }
        } else if (this.isMarkdownLike(trimmedPart)) {
          markdownContent += trimmedPart + '\n';
        }
      }

      // 清理markdown内容
      markdownContent = this.cleanMarkdownContent(markdownContent);
      
      // 使用markdown处理器进行深度处理
      if (markdownContent) {
        processedMarkdown = this.markdownProcessor.processMarkdown(markdownContent);
      }

    } catch (error) {
      console.error('Error extracting mixed data:', error);
      // 如果解析失败，尝试直接提取markdown部分
      markdownContent = this.extractMarkdownFallback(rawResponse);
    }

    return {
      apiCalls,
      apiResponses,
      errors,
      markdownContent,
      processedMarkdown,
      rawData: rawResponse
    };
  }

  /**
   * 分割混合数据
   */
  private splitMixedData(data: string): string[] {
    // 使用正则表达式分割JSON对象和markdown内容
    const parts: string[] = [];
    let currentPart = '';
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      
      if (escapeNext) {
        currentPart += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        currentPart += char;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
      }

      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
        }
      }

      currentPart += char;

      // 当大括号平衡且不在字符串中时，可能是一个完整的JSON对象
      if (braceCount === 0 && !inString && char === '}') {
        parts.push(currentPart);
        currentPart = '';
      }
    }

    // 添加剩余部分
    if (currentPart.trim()) {
      parts.push(currentPart);
    }

    return parts;
  }

  /**
   * 判断是否像JSON
   */
  private isJsonLike(text: string): boolean {
    const trimmed = text.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
           (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }

  /**
   * 判断是否像Markdown
   */
  private isMarkdownLike(text: string): boolean {
    const markdownPatterns = [
      /^#{1,6}\s+/m,  // 标题
      /^\*\s+/m,      // 列表
      /^-\s+/m,       // 列表
      /^\d+\.\s+/m,   // 有序列表
      /\*\*.*\*\*/,   // 粗体
      /\*.*\*/,       // 斜体
      /^---$/m,       // 分隔线
      /^\|.*\|$/m,    // 表格
      /^>\s+/m        // 引用
    ];

    return markdownPatterns.some(pattern => pattern.test(text)) ||
           text.includes('##') ||
           text.includes('**') ||
           text.includes('---');
  }

  /**
   * 分类JSON数据
   */
  private categorizeJsonData(
    jsonData: any,
    apiCalls: CozeApiCall[],
    apiResponses: CozeApiResponse[],
    errors: CozeErrorResponse[]
  ): void {
    if (jsonData.name && jsonData.arguments) {
      // API调用
      apiCalls.push(jsonData as CozeApiCall);
    } else if (jsonData.error || jsonData.message || 
               (typeof jsonData === 'string' && jsonData.includes('Error'))) {
      // 错误响应
      errors.push(jsonData as CozeErrorResponse);
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      // API响应
      apiResponses.push(jsonData as CozeApiResponse);
    }
  }

  /**
   * 清理markdown内容
   */
  private cleanMarkdownContent(content: string): string {
    let cleaned = content
      .replace(/\n{3,}/g, '\n\n') // 移除多余的空行
      .replace(/\r\n/g, '\n') // 统一换行符
      .trim();
    
    // 特殊处理：移除混合在Markdown中的JSON片段
    cleaned = cleaned
      .replace(/\{[^{}]*"plugin"[^{}]*\}/g, '') // 移除plugin相关JSON
      .replace(/\{[^{}]*"八字"[^{}]*\}/g, '') // 移除八字数据JSON
      .replace(/\{[^{}]*"紫微斗数"[^{}]*\}/g, '') // 移除紫微斗数JSON
      .replace(/\{[^{}]*"手相分析"[^{}]*\}/g, '') // 移除手相分析JSON
      .replace(/\{[^{}]*"arguments"[^{}]*\}/g, '') // 移除API调用JSON
      .replace(/\{"name":"[^"]*","arguments":\{[^}]*\}\}/g, ''); // 移除完整的API调用
    
    // 清理连续的空行
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // 确保【命主信息概览】等重要标题前有适当的空行
    cleaned = cleaned.replace(/([^\n])\n(【[^】]+】)/g, '$1\n\n$2');
    
    // 确保标题后有适当的空行
    cleaned = cleaned.replace(/(【[^】]+】)\n([^#\n-*])/g, '$1\n\n$2');
    
    return cleaned.trim();
  }

  /**
   * 备用markdown提取方法
   */
  private extractMarkdownFallback(data: string): string {
    // 寻找markdown模式的内容
    const markdownStart = data.search(/#{1,6}\s+/);
    if (markdownStart !== -1) {
      return data.substring(markdownStart).trim();
    }

    // 寻找包含中文和markdown格式的部分
    const chineseMarkdownMatch = data.match(/[##\*\-].*[\u4e00-\u9fa5].*$/s);
    if (chineseMarkdownMatch) {
      return chineseMarkdownMatch[0].trim();
    }

    return '';
  }

  /**
   * 提取纯markdown内容（去除JSON部分）
   */
  extractMarkdownOnly(rawResponse: string): string {
    const extracted = this.extractMixedData(rawResponse);
    return extracted.markdownContent;
  }

  /**
   * 提取API调用信息
   */
  extractApiCalls(rawResponse: string): CozeApiCall[] {
    const extracted = this.extractMixedData(rawResponse);
    return extracted.apiCalls;
  }

  /**
   * 提取API响应信息
   */
  extractApiResponses(rawResponse: string): CozeApiResponse[] {
    const extracted = this.extractMixedData(rawResponse);
    return extracted.apiResponses;
  }

  /**
   * 检查是否有错误
   */
  hasErrors(rawResponse: string): boolean {
    const extracted = this.extractMixedData(rawResponse);
    return extracted.errors.length > 0;
  }

  /**
   * 获取错误信息
   */
  getErrors(rawResponse: string): CozeErrorResponse[] {
    const extracted = this.extractMixedData(rawResponse);
    return extracted.errors;
  }
}