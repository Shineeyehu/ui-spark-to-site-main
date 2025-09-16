/**
 * 知识卡HTML模板生成器
 * 基于prompt.txt中的HTML结构，使用数据填充生成完整的知识卡
 */

import { ExtractedCozeData } from './coze-data-extractor';

export interface KnowledgeCardData {
  // 基本信息
  title: string;
  subtitle: string;
  name: string;
  gender: string;
  birthDateTime: string;
  fourPillars: string;
  ziWeiInfo: string;
  
  // 核心分析
  personalityAnalysis: string;
  talentAnalysis: string;
  growthKeyPoints: string;
  
  // 天赋挖掘
  locationAdvice: string;
  academicDirection: string;
  interestCultivation: string;
  careerRecommendation: string;
  
  // 2025年运势
  fortuneOutlook: string;
  
  // 大师结语
  masterConclusion: string;
  disclaimer: string;
}

export class KnowledgeCardTemplate {
  /**
   * 安全地转义HTML特殊字符
   */
  private static escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 安全地处理HTML内容，保留必要的HTML标签
   */
  private static sanitizeHtmlContent(content: string): string {
    if (!content) return '';
    
    // 对于已经包含HTML标签的内容，只转义可能有问题的字符
    if (content.includes('<') && content.includes('>')) {
      return content
        .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;') // 只转义未转义的&符号
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    
    // 对于纯文本内容，进行完整转义
    return this.escapeHtml(content);
  }

  /**
   * 生成完整的HTML知识卡
   */
  static generateHTML(data: KnowledgeCardData): string {
    // 确保所有数据都经过正确的编码处理
    const safeData = {
      title: this.sanitizeHtmlContent(data.title),
      subtitle: this.sanitizeHtmlContent(data.subtitle),
      name: this.sanitizeHtmlContent(data.name),
      gender: this.sanitizeHtmlContent(data.gender),
      birthDateTime: this.sanitizeHtmlContent(data.birthDateTime),
      fourPillars: this.sanitizeHtmlContent(data.fourPillars),
      ziWeiInfo: this.sanitizeHtmlContent(data.ziWeiInfo),
      personalityAnalysis: this.sanitizeHtmlContent(data.personalityAnalysis),
      talentAnalysis: this.sanitizeHtmlContent(data.talentAnalysis),
      growthKeyPoints: this.sanitizeHtmlContent(data.growthKeyPoints),
      locationAdvice: this.sanitizeHtmlContent(data.locationAdvice),
      academicDirection: this.sanitizeHtmlContent(data.academicDirection),
      interestCultivation: this.sanitizeHtmlContent(data.interestCultivation),
      careerRecommendation: this.sanitizeHtmlContent(data.careerRecommendation),
      fortuneOutlook: this.sanitizeHtmlContent(data.fortuneOutlook),
      masterConclusion: this.sanitizeHtmlContent(data.masterConclusion),
      disclaimer: this.sanitizeHtmlContent(data.disclaimer)
    };

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>知识卡 - ${safeData.title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css?family=Noto+Serif+SC:wght@400;700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', 'Noto Serif SC', sans-serif; }
  h1, h2, h3 { font-family: 'Noto Serif SC', serif; }
  .card-container {
    width: 700px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
</style>
</head>
<body class="bg-gray-100 flex justify-center p-8">
<div class="card-container bg-white rounded-2xl overflow-hidden flex flex-col p-8">

  <header class="pb-6 border-b-2 border-gray-200 mb-6 text-center">
    <h1 class="text-4xl font-extrabold text-gray-800 mb-1 leading-tight tracking-wider">${safeData.title}</h1>
    <p class="text-sm text-gray-500">${safeData.subtitle}</p>
  </header>

  <main class="flex flex-col space-y-8">
    
    <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-inner space-y-2">
      <h2 class="text-xl font-semibold text-blue-900">命主信息概览</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-700">
        <div class="flex items-center"><i class="fas fa-venus-mars text-indigo-500 mr-2"></i>性别：${safeData.gender}</div>
        <div class="flex items-center"><i class="fas fa-birthday-cake text-indigo-500 mr-2"></i>出生时间：${safeData.birthDateTime}</div>
        <div class="flex items-center sm:col-span-2"><i class="fas fa-seedling text-indigo-500 mr-2"></i>四柱八字：${safeData.fourPillars}</div>
        <div class="flex items-center sm:col-span-2"><i class="fas fa-star text-indigo-500 mr-2"></i>紫微主星：${safeData.ziWeiInfo}</div>
      </div>
    </div>
    
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">一、 核心命理分析报告</h2>
      
      <div class="p-6 bg-white rounded-lg shadow-sm space-y-4">
        <h3 class="text-lg font-semibold text-gray-800"><i class="fas fa-seedling text-green-600 mr-2"></i>性格特质与教养指南</h3>
        <p class="text-sm text-gray-700 leading-relaxed">${safeData.personalityAnalysis}</p>
      </div>

      <div class="p-6 bg-white rounded-lg shadow-sm space-y-4">
        <h3 class="text-lg font-semibold text-gray-800"><i class="fas fa-lightbulb text-yellow-600 mr-2"></i>潜在天赋深掘</h3>
        <div class="text-sm text-gray-700 leading-relaxed">
          ${safeData.talentAnalysis}
        </div>
      </div>

      <div class="p-6 bg-purple-50 border-l-4 border-purple-400 rounded-r-xl shadow-inner">
        <h3 class="text-lg font-semibold text-purple-900 mb-2">成长关键节点</h3>
        <p class="text-sm text-purple-800 leading-relaxed">${safeData.growthKeyPoints}</p>
      </div>
    </div>

    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">二、 天赋挖掘与成长建议</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm space-y-2">
          <h3 class="text-md font-semibold text-gray-800"><i class="fas fa-map-marker-alt text-red-500 mr-2"></i>地域适配建议</h3>
          <p class="text-xs text-gray-700">${safeData.locationAdvice}</p>
        </div>
        <div class="p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm space-y-2">
          <h3 class="text-md font-semibold text-gray-800"><i class="fas fa-book-open text-red-500 mr-2"></i>学业方向指引</h3>
          <p class="text-xs text-gray-700">${safeData.academicDirection}</p>
        </div>
        <div class="p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm space-y-2">
          <h3 class="text-md font-semibold text-gray-800"><i class="fas fa-chess-knight text-red-500 mr-2"></i>兴趣培养清单</h3>
          <p class="text-xs text-gray-700">${safeData.interestCultivation}</p>
        </div>
        <div class="p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm space-y-2">
          <h3 class="text-md font-semibold text-gray-800"><i class="fas fa-briefcase text-red-500 mr-2"></i>未来行业适配参考</h3>
          <p class="text-xs text-gray-700">${safeData.careerRecommendation}</p>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">三、 2025年运势展望</h2>
      <div class="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm">
        <div class="text-sm text-gray-700 leading-relaxed">
          ${safeData.fortuneOutlook}
        </div>
      </div>
    </div>
    
    <div class="p-8 bg-white border-t-2 border-b-2 border-gray-200 my-6">
      <div class="flex items-center justify-center mb-4">
        <img src="https://lf-bot-studio-plugin-resource.coze.cn/obj/bot-studio-platform-plugin-tos/artist/image/4b64ed25d4b34967939801a20aff1cdd.png" alt="命格意象图" class="w-24 h-24 object-cover rounded-full mr-4">
        <div class="flex-1 text-center">
            <h3 class="text-lg font-bold text-gray-800">玄机子大师结语</h3>
            <p class="text-sm text-gray-500 mt-1">人生的精彩在于每个人的独特选择与努力。</p>
        </div>
      </div>
      <p class="text-sm text-gray-700 leading-relaxed mb-4">${safeData.masterConclusion}</p>
      <p class="text-xs text-gray-400 mt-2 text-center">${safeData.disclaimer}</p>
    </div>
  </main>
  
  <footer class="mt-8 border-t border-gray-200 pt-4 text-center">
    <p class="text-xs text-gray-400">本知识卡由 AI 知识卡设计师生成</p>
  </footer>

</div>
</body>
</html>`;
  }

  /**
   * 从扣子提取的数据转换为模板数据
   */
  static fromCozeData(cozeData: ExtractedCozeData): KnowledgeCardData {
    return {
      title: '玄机子大师天赋挖掘知识卡',
      subtitle: `${cozeData.name || '命主'}的专属天赋挖掘报告`,
      name: cozeData.name || '命主',
      gender: cozeData.gender || '未知',
      birthDateTime: this.formatBirthDateTime(cozeData.birthDate, cozeData.birthTime),
      fourPillars: cozeData.fourPillars || '信息待完善',
      ziWeiInfo: this.formatZiWeiInfo(cozeData.ziWeiMainStar, cozeData.bodyPalace),
      
      personalityAnalysis: this.formatPersonalityAnalysis(cozeData),
      talentAnalysis: this.formatTalentAnalysis(cozeData),
      growthKeyPoints: this.formatGrowthKeyPoints(cozeData),
      
      locationAdvice: cozeData.academicDirection || '根据个人特质选择适合的环境发展。',
      academicDirection: cozeData.academicDirection || cozeData.subjectPreferences || '建议根据兴趣和天赋选择学业方向。',
      interestCultivation: cozeData.interestRecommendations || cozeData.hobbyList || '培养多元化兴趣，促进全面发展。',
      careerRecommendation: cozeData.careerDirection || cozeData.industryRecommendations || '选择符合个人特质的职业发展道路。',
      
      fortuneOutlook: this.formatFortuneOutlook(cozeData),
      
      masterConclusion: this.formatMasterConclusion(cozeData),
      disclaimer: '本分析仅为基于传统命理学的文化参考，不构成绝对决策依据。'
    };
  }

  /**
   * 格式化出生日期时间
   */
  private static formatBirthDateTime(birthDate?: string, birthTime?: string): string {
    if (birthDate && birthTime) {
      return `${birthDate} ${birthTime}`;
    } else if (birthDate) {
      return birthDate;
    } else {
      return '出生信息待完善';
    }
  }

  /**
   * 格式化紫微斗数信息
   */
  private static formatZiWeiInfo(mainStar?: string, bodyPalace?: string): string {
    const parts = [];
    if (mainStar) {
      parts.push(`命宫[${mainStar}]`);
    }
    if (bodyPalace) {
      parts.push(`身宫[${bodyPalace}]`);
    }
    return parts.length > 0 ? parts.join(' | ') : '紫微信息待完善';
  }

  /**
   * 格式化性格分析
   */
  private static formatPersonalityAnalysis(data: ExtractedCozeData): string {
    const parts = [];
    
    if (data.personalityTraits) {
      parts.push(data.personalityTraits);
    }
    
    if (data.coreCharacteristics) {
      parts.push(data.coreCharacteristics);
    }
    
    // 如果没有提取到具体的性格分析，尝试从原始内容中提取
    if (parts.length === 0 && data.rawContent) {
      const rawAnalysis = this.extractFromRawContent(data.rawContent, ['性格', '个性', '特质', '特点']);
      if (rawAnalysis) {
        parts.push(rawAnalysis);
      }
    }
    
    if (parts.length === 0) {
      return '您具有独特的个性特质，建议通过深入了解自己的优势来发挥潜能。在成长过程中，保持开放的心态，勇于探索和尝试新事物。';
    }
    
    return parts.join(' ');
  }

  /**
   * 格式化天赋分析
   */
  private static formatTalentAnalysis(data: ExtractedCozeData): string {
    const talents = [];
    
    if (data.talents) {
      talents.push(`<p><i class="fas fa-brain text-blue-500 mr-2"></i>核心天赋：${data.talents}</p>`);
    }
    
    if (data.strengths) {
      talents.push(`<p><i class="fas fa-star text-blue-500 mr-2"></i>优势特长：${data.strengths}</p>`);
    }
    
    if (talents.length === 0) {
      talents.push('<p><i class="fas fa-lightbulb text-blue-500 mr-2"></i>智慧学识：具有良好的学习能力和思维潜质。</p>');
      talents.push('<p><i class="fas fa-heart text-blue-500 mr-2"></i>情感智慧：善于理解和处理人际关系。</p>');
    }
    
    return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">${talents.join('')}</div>
            <p class="text-sm text-gray-700 leading-relaxed mt-4">建议在成长过程中重点培养和发挥这些天赋优势。</p>`;
  }

  /**
   * 格式化成长关键节点
   */
  private static formatGrowthKeyPoints(data: ExtractedCozeData): string {
    if (data.currentFortune || data.futureOutlook) {
      return `${data.currentFortune || ''} ${data.futureOutlook || ''}`.trim();
    }
    
    if (data.growthAdvice) {
      return data.growthAdvice;
    }
    
    return '当前正处于重要的成长发展期，建议把握机遇，稳步前进。未来发展前景良好，适合制定长远规划。';
  }

  /**
   * 格式化2025年运势展望
   */
  private static formatFortuneOutlook(data: ExtractedCozeData): string {
    const parts = [];
    
    if (data.year2025Forecast) {
      parts.push(`<h4 class="font-semibold text-gray-800 mb-2"><i class="fas fa-calendar-alt text-orange-500 mr-2"></i>整体运势</h4>`);
      parts.push(`<p class="mb-4">${data.year2025Forecast}</p>`);
    }
    
    if (data.importantEvents) {
      parts.push(`<h4 class="font-semibold text-gray-800 mb-2"><i class="fas fa-star text-orange-500 mr-2"></i>重要事件</h4>`);
      parts.push(`<p class="mb-4">${data.importantEvents}</p>`);
    }
    
    if (data.developmentSuggestions) {
      parts.push(`<h4 class="font-semibold text-gray-800 mb-2"><i class="fas fa-lightbulb text-orange-500 mr-2"></i>发展建议</h4>`);
      parts.push(`<p>${data.developmentSuggestions}</p>`);
    }
    
    if (parts.length === 0) {
      parts.push(`<h4 class="font-semibold text-gray-800 mb-2"><i class="fas fa-calendar-alt text-orange-500 mr-2"></i>2025年展望</h4>`);
      parts.push(`<p>2025年整体运势平稳向上，适合稳步发展和积累。建议保持积极心态，把握发展机遇。</p>`);
    }
    
    return parts.join('');
  }

  /**
   * 格式化大师结语
   */
  private static formatMasterConclusion(data: ExtractedCozeData): string {
    if (data.growthAdvice && data.developmentSuggestions) {
      return `${data.growthAdvice} ${data.developmentSuggestions}`;
    }
    
    if (data.growthAdvice) {
      return data.growthAdvice;
    }
    
    return '天地造化，各有其道。愿您在人生长河中，既能激流勇进，亦能静水深流。以智慧涵养气度，以勇气开拓前路，以和谐广结善缘。切记：刚柔并济方为大道，动静相宜始得圆满。';
  }

  /**
   * 从原始内容中提取相关信息
   */
  private static extractFromRawContent(content: string, keywords: string[]): string | undefined {
    for (const keyword of keywords) {
      // 查找包含关键词的句子或段落
      const sentences = content.split(/[。.！!？?\n]/);
      for (const sentence of sentences) {
        if (sentence.includes(keyword) && sentence.length > 10) {
          return sentence.trim();
        }
      }
    }
    return undefined;
  }
}