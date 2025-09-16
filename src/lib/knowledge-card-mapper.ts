/**
 * 知识卡数据映射器
 * 负责将扣子API返回的原始数据映射到HTML模板所需的格式
 */

import { CozeDataExtractor, ExtractedCozeData } from './coze-data-extractor';
import { CozeMixedDataExtractor } from './coze-mixed-data-extractor';
import { markdownProcessor } from './markdown-processor';
import { KnowledgeCardTemplate, KnowledgeCardData } from './knowledge-card-template';

export interface CozeRawResponse {
  content: string;
  status?: string;
  timestamp?: number;
}

export interface ProcessingResult {
  success: boolean;
  data?: KnowledgeCardData;
  html?: string;
  error?: string;
  extractedData?: ExtractedCozeData;
  completenessScore?: number;
}

export class KnowledgeCardMapper {
  private mixedDataExtractor: CozeMixedDataExtractor;

  constructor() {
    // 不需要实例化 CozeDataExtractor，因为它使用静态方法
    this.mixedDataExtractor = new CozeMixedDataExtractor();
  }

  /**
   * 处理扣子API原始响应，生成HTML知识卡
   */
  async processCozeResponse(rawResponse: string): Promise<ProcessingResult> {
    try {
      console.log('🚀 开始处理扣子响应数据...');
      
      // 1. 清理原始响应数据
      const cleanedData = this.cleanRawResponse(rawResponse);
      console.log('🧹 数据清理完成，长度:', cleanedData.length);
      
      // 2. 尝试使用混合数据提取器处理markdown内容
      let extractedData: ExtractedCozeData;
      const mixedData = this.mixedDataExtractor.extractFromResponse(cleanedData);
      
      if (mixedData.processedMarkdown && mixedData.markdownContent) {
        console.log('📝 使用混合数据提取器处理markdown内容');
        // 使用markdown处理器格式化数据为知识卡片格式
        const formattedData = markdownProcessor.formatForKnowledgeCard(mixedData.processedMarkdown);
        
        // 转换为ExtractedCozeData格式
        extractedData = {
          personalityTraits: formattedData.personalityAnalysis,
          talents: formattedData.talentAnalysis,
          year2025Forecast: formattedData.fortuneOutlook,
          growthAdvice: formattedData.masterConclusion,
          rawContent: formattedData.fullContent
        };
        console.log('✨ Markdown数据格式化完成');
      } else {
        console.log('📤 使用传统数据提取器');
        // 3. 使用传统提取器作为备选方案
        extractedData = CozeDataExtractor.extractFromRawData(cleanedData);
      }
      
      console.log('📤 数据提取完成');
      
      // 3. 验证数据完整性
      const completenessScore = CozeDataExtractor.getDataCompleteness(extractedData);
      
      console.log('✅ 数据验证结果:', { completenessScore });
      
      // 降低完整性要求，只要有原始内容就尝试生成
      if (completenessScore < 0.1 && !extractedData.rawContent) {
        console.error('❌ 数据验证失败，没有可用的内容');
        return {
          success: false,
          error: '没有可用的内容生成知识卡',
          extractedData,
          completenessScore
        };
      }
      
      if (completenessScore < 0.3) {
        console.warn('⚠️ 数据完整性较低，将使用默认值补充');
      }

      // 4. 转换为模板数据格式
      const templateData = KnowledgeCardTemplate.fromCozeData(extractedData);
      console.log('🔄 模板数据转换完成');
      
      // 5. 生成HTML
      const html = KnowledgeCardTemplate.generateHTML(templateData);
      console.log('🎨 HTML生成完成，长度:', html.length);

      return {
        success: true,
        data: templateData,
        html,
        extractedData,
        completenessScore
      };

    } catch (error) {
      return {
        success: false,
        error: `数据处理失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 清理扣子API原始响应数据
   * 移除系统消息和无关内容，提取核心命理分析内容
   */
  private cleanRawResponse(rawResponse: string): string {
    // 移除系统状态信息
    let cleaned = rawResponse
      .replace(/\{"plugin":"[^"]*"\}\{"status":"[^"]*","reason":"[^"]*"\}/g, '')
      .replace(/\{"msg_type":"generate_answer_finish"[^}]*\}/g, '')
      .replace(/\{"msg_type":"[^"]*"[^}]*\}/g, '')
      .replace(/\{"status":"[^"]*"[^}]*\}/g, '');

    // 移除时间戳和其他系统信息
    cleaned = cleaned
      .replace(/\d{4}\s年对这个孩子来说有什么重要的事情发生吗？/g, '')
      .replace(/这个孩子的事业发展如何？/g, '')
      .replace(/如何增强这个孩子的运势？/g, '');

    // 移除多余的空白字符
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // 如果清理后的内容太短，返回原始内容
    if (cleaned.length < 100) {
      return rawResponse;
    }

    return cleaned;
  }

  /**
   * 验证生成的HTML是否有效
   */
  validateGeneratedHTML(html: string): boolean {
    // 基本HTML结构检查
    const hasDoctype = html.includes('<!DOCTYPE html>');
    const hasHtmlTag = html.includes('<html') && html.includes('</html>');
    const hasHead = html.includes('<head>') && html.includes('</head>');
    const hasBody = html.includes('<body>') && html.includes('</body>');
    
    // 内容检查
    const hasTitle = html.includes('知识卡') || html.includes('命理分析');
    const hasMainContent = html.length > 5000; // 确保有足够的内容
    
    return hasDoctype && hasHtmlTag && hasHead && hasBody && hasTitle && hasMainContent;
  }

  /**
   * 获取数据提取统计信息
   */
  getExtractionStats(extractedData: ExtractedCozeData): {
    totalFields: number;
    filledFields: number;
    emptyFields: string[];
    completenessPercentage: number;
  } {
    const allFields = [
      'name', 'gender', 'birthDate', 'birthTime', 'fourPillars',
      'ziWeiMainStar', 'bodyPalace', 'personalityTraits', 'coreCharacteristics',
      'talents', 'strengths', 'academicDirection', 'subjectPreferences',
      'interestRecommendations', 'hobbyList', 'careerDirection',
      'industryRecommendations', 'currentFortune', 'futureOutlook',
      'year2025Forecast', 'importantEvents', 'developmentSuggestions',
      'growthAdvice'
    ];

    const filledFields = allFields.filter(field => {
      const value = extractedData[field as keyof ExtractedCozeData];
      return value && value.toString().trim().length > 0;
    });

    const emptyFields = allFields.filter(field => {
      const value = extractedData[field as keyof ExtractedCozeData];
      return !value || value.toString().trim().length === 0;
    });

    return {
      totalFields: allFields.length,
      filledFields: filledFields.length,
      emptyFields,
      completenessPercentage: Math.round((filledFields.length / allFields.length) * 100)
    };
  }

  /**
   * 生成数据质量报告
   */
  generateQualityReport(result: ProcessingResult): string {
    if (!result.extractedData) {
      return '无法生成质量报告：缺少提取数据';
    }

    const stats = this.getExtractionStats(result.extractedData);
    
    let report = `数据提取质量报告：\n`;
    report += `- 总字段数：${stats.totalFields}\n`;
    report += `- 已填充字段：${stats.filledFields}\n`;
    report += `- 完整度：${stats.completenessPercentage}%\n`;
    report += `- 完整性评分：${result.completenessScore?.toFixed(2) || 'N/A'}\n`;
    
    if (stats.emptyFields.length > 0) {
      report += `- 缺失字段：${stats.emptyFields.join(', ')}\n`;
    }

    if (result.html) {
      const htmlValid = this.validateGeneratedHTML(result.html);
      report += `- HTML有效性：${htmlValid ? '✓ 有效' : '✗ 无效'}\n`;
      report += `- HTML长度：${result.html.length} 字符\n`;
    }

    return report;
  }

  /**
   * 批量处理多个扣子响应
   */
  async processBatch(responses: string[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (const response of responses) {
      const result = await this.processCozeResponse(response);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 导出处理结果为JSON
   */
  exportResult(result: ProcessingResult): string {
    return JSON.stringify({
      success: result.success,
      timestamp: new Date().toISOString(),
      data: result.data,
      extractedData: result.extractedData,
      completenessScore: result.completenessScore,
      error: result.error,
      qualityReport: this.generateQualityReport(result)
    }, null, 2);
  }
}