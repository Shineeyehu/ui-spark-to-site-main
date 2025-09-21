/**
 * 知识卡片处理器 - 专门处理Coze API返回的数据并转换为知识卡片格式
 * 这是知识卡片的核心模块，负责精准展示Coze API返回的数据
 */

import { marked } from "marked";

/**
 * 配置marked选项
 */
marked.setOptions({
  breaks: true, // 支持换行符
  gfm: true, // 支持GitHub风格的markdown
});

/**
 * 知识卡片数据结构
 */
export interface KnowledgeCardData {
  overview: {
    gender: string;
    birthTime: string;
    bazi: string;
    ziwei: string;
    handType: string;
  };
  analysis: {
    personality: string;
    talents: string;
    growth: string;
  };
  suggestions: {
    location: string;
    education: string;
    interests: string;
    career: string;
  };
  conclusion: string;
}

/**
 * 从Coze API返回的原始数据中提取知识卡片信息
 * @param rawContent - Coze API返回的原始内容
 * @returns 结构化的知识卡片数据
 */
export function extractKnowledgeCardData(rawContent: string): KnowledgeCardData {
  if (!rawContent || typeof rawContent !== "string") {
    return {
      overview: { gender: '', birthTime: '', bazi: '', ziwei: '', handType: '' },
      analysis: { personality: '', talents: '', growth: '' },
      suggestions: { location: '', education: '', interests: '', career: '' },
      conclusion: ''
    };
  }

  console.log('开始提取知识卡片数据...');
  
  // 清理噪声
  const cleanContent = cleanCozeNoise(rawContent);
  
  // 首先分离概览部分和后续内容
  const { overviewContent, remainingContent } = separateOverviewFromContent(cleanContent);
  
  // 从概览部分提取基本信息
  const overview = extractOverviewData(overviewContent);
  
  // 从剩余内容提取其他部分
  const analysis = extractAnalysisData(remainingContent);
  const suggestions = extractSuggestionsData(remainingContent);
  const conclusion = extractConclusionData(remainingContent);
  
  const result = {
    overview,
    analysis,
    suggestions,
    conclusion
  };
  
  console.log('知识卡片数据提取完成:', result);
  return result;
}

/**
 * 分离概览部分和后续内容
 * @param content - 原始内容
 * @returns 分离后的概览内容和剩余内容
 */
function separateOverviewFromContent(content: string): { overviewContent: string; remainingContent: string } {
  console.log('开始分离概览部分和剩余内容...');
  console.log('原始内容长度:', content.length);
  
  // 查找概览部分的开始
  const overviewStart = content.search(/【命主信息概览】/);
  console.log('概览开始位置:', overviewStart);
  
  if (overviewStart === -1) {
    console.log('未找到概览部分，返回整个内容作为剩余内容');
    return { overviewContent: '', remainingContent: content };
  }
  
  // 从概览开始位置提取内容
  const fromOverview = content.slice(overviewStart);
  console.log('从概览开始的内容:', fromOverview.substring(0, 200) + '...');
  
  // 查找分隔符位置（---）
  const separatorIndex = fromOverview.search(/^---/m);
  console.log('分隔符位置:', separatorIndex);
  
  if (separatorIndex !== -1) {
    // 找到分隔符，在分隔符处截断
    const overviewContent = fromOverview.slice(0, separatorIndex).trim();
    const remainingContent = fromOverview.slice(separatorIndex).trim();
    console.log('概览内容（分隔符前）:', overviewContent);
    console.log('剩余内容（分隔符后）:', remainingContent.substring(0, 200) + '...');
    return { overviewContent, remainingContent };
  } else {
    console.log('未找到分隔符，查找下一章节...');
    // 没有找到分隔符，查找下一个主要章节
    const nextSectionPatterns = [
      /^##\s*一、\s*核心命理分析报告/m,
      /^##\s*核心命理分析报告/m,
      /^##\s*一、/m,
      /^###\s*二、\s*天赋挖掘与成长建议/m,
      /^###\s*天赋挖掘与成长建议/m,
      /^###\s*二、/m,
      /^##\s*国学课程推荐/m
    ];
    
    let nextSectionIndex = -1;
    for (const pattern of nextSectionPatterns) {
      const match = fromOverview.search(pattern);
      if (match !== -1) {
        nextSectionIndex = match;
        console.log('找到下一章节模式:', pattern, '位置:', match);
        break;
      }
    }
    
    if (nextSectionIndex !== -1) {
      const overviewContent = fromOverview.slice(0, nextSectionIndex).trim();
      const remainingContent = fromOverview.slice(nextSectionIndex).trim();
      console.log('概览内容（下一章节前）:', overviewContent);
      console.log('剩余内容（下一章节后）:', remainingContent.substring(0, 200) + '...');
      return { overviewContent, remainingContent };
    } else {
      console.log('未找到下一章节，查找手型字段后的内容...');
      // 如果没找到明显的章节分隔，尝试在手型字段后查找
      const handTypeMatch = fromOverview.match(/\*\s*\*\*手型\*\*\s*[：:]\s*([^---\n]+)(---.*)/s);
      if (handTypeMatch) {
        const handTypeEnd = handTypeMatch.index! + handTypeMatch[0].indexOf('---');
        const overviewContent = fromOverview.slice(0, handTypeEnd).trim();
        const remainingContent = fromOverview.slice(handTypeEnd).trim();
        console.log('概览内容（手型字段后）:', overviewContent);
        console.log('剩余内容（手型字段后）:', remainingContent.substring(0, 200) + '...');
        return { overviewContent, remainingContent };
      } else {
        console.log('未找到明显的分隔点，尝试在手型字段后分离...');
        // 如果没找到明显的分隔点，尝试在手型字段后分离
        const handTypeLineMatch = fromOverview.match(/(\*\s*\*\*手型\*\*\s*[：:][^\n]*)/);
        if (handTypeLineMatch) {
          const handTypeLineEnd = handTypeLineMatch.index! + handTypeLineMatch[0].length;
          const overviewContent = fromOverview.slice(0, handTypeLineEnd).trim();
          const remainingContent = fromOverview.slice(handTypeLineEnd).trim();
          console.log('概览内容（手型行后）:', overviewContent);
          console.log('剩余内容（手型行后）:', remainingContent.substring(0, 200) + '...');
          return { overviewContent, remainingContent };
        } else {
          console.log('未找到手型字段，返回整个内容作为概览');
          // 没有找到明显的分隔点，返回整个内容作为概览
          return { overviewContent: fromOverview, remainingContent: '' };
        }
      }
    }
  }
}

/**
 * 提取概览数据（基本信息）
 */
function extractOverviewData(content: string) {
  const overview = {
    gender: '',
    birthTime: '',
    bazi: '',
    ziwei: '',
    handType: ''
  };

  // 提取性别
  const genderMatch = content.match(/\*\s*\*\*性别\*\*\s*[：:]\s*([^\n]+)/);
  if (genderMatch) {
    overview.gender = genderMatch[1].trim();
  }

  // 提取出生时间
  const birthTimeMatch = content.match(/\*\s*\*\*出生时间\*\*\s*[：:]\s*([^\n]+)/);
  if (birthTimeMatch) {
    overview.birthTime = birthTimeMatch[1].trim();
  }

  // 提取四柱八字
  const baziMatch = content.match(/\*\s*\*\*四柱八字\*\*\s*[：:]\s*([^\n]+)/);
  if (baziMatch) {
    overview.bazi = baziMatch[1].trim();
  }

  // 提取紫微主星
  const ziweiMatch = content.match(/\*\s*\*\*紫微主星\*\*\s*[：:]\s*([^\n]+)/);
  if (ziweiMatch) {
    overview.ziwei = ziweiMatch[1].trim();
  }

  // 提取手型 - 需要特别处理，因为可能包含分隔线和后续内容
  const handTypeMatch = content.match(/\*\s*\*\*手型\*\*\s*[：:]\s*([^---\n]+)/);
  if (handTypeMatch) {
    // 清理手型内容，移除可能包含的分隔线和标题
    let handType = handTypeMatch[1].trim();
    // 移除分隔线和后续的标题内容
    handType = handType.replace(/---.*$/, '').trim();
    // 进一步清理，移除可能连在一起的Markdown标题
    handType = handType.replace(/#{1,6}\s*[^\n]*$/, '').trim();
    overview.handType = handType;
  }

  return overview;
}

/**
 * 提取分析报告数据
 */
function extractAnalysisData(content: string) {
  const analysis = {
    personality: '',
    talents: '',
    growth: ''
  };

  // 提取性格特质与教养指南
  const personalityMatch = content.match(/####\s*1\.\s*性格特质与教养指南[^]*?(?=####|$)/s);
  if (personalityMatch) {
    analysis.personality = personalityMatch[0].trim();
  }

  // 提取潜在天赋深掘
  const talentsMatch = content.match(/####\s*2\.\s*潜在天赋深掘[^]*?(?=####|$)/s);
  if (talentsMatch) {
    analysis.talents = talentsMatch[0].trim();
  }

  // 提取成长关键节点
  const growthMatch = content.match(/####\s*3\.\s*成长关键节点[^]*?(?=####|$)/s);
  if (growthMatch) {
    analysis.growth = growthMatch[0].trim();
  }

  return analysis;
}

/**
 * 提取建议数据
 */
function extractSuggestionsData(content: string) {
  const suggestions = {
    location: '',
    education: '',
    interests: '',
    career: ''
  };

  // 提取地域适配建议
  const locationMatch = content.match(/####\s*1\.\s*地域适配建议[^]*?(?=####|$)/s);
  if (locationMatch) {
    suggestions.location = locationMatch[0].trim();
  }

  // 提取学业方向指引
  const educationMatch = content.match(/####\s*2\.\s*学业方向指引[^]*?(?=####|$)/s);
  if (educationMatch) {
    suggestions.education = educationMatch[0].trim();
  }

  // 提取兴趣培养清单
  const interestsMatch = content.match(/####\s*3\.\s*兴趣培养清单[^]*?(?=####|$)/s);
  if (interestsMatch) {
    suggestions.interests = interestsMatch[0].trim();
  }

  // 提取未来行业适配参考
  const careerMatch = content.match(/####\s*4\.\s*未来行业适配参考[^]*?(?=####|$)/s);
  if (careerMatch) {
    suggestions.career = careerMatch[0].trim();
  }

  return suggestions;
}

/**
 * 提取结语数据
 */
function extractConclusionData(content: string) {
  const conclusionMatch = content.match(/###\s*【玄机子大师结语】[^]*?(?=###|$)/s);
  if (conclusionMatch) {
    return conclusionMatch[0].trim();
  }
  return '';
}

/**
 * 生成概览部分的HTML
 */
export function generateOverviewHTML(overview: KnowledgeCardData['overview']): string {
  if (!overview.gender && !overview.birthTime && !overview.bazi && !overview.ziwei && !overview.handType) {
    return '';
  }

  return `
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
      <h2 class="text-xl font-bold text-amber-900 mb-3 border-b border-amber-300 pb-2 tracking-wide">【命主信息概览】</h2>
      <ul class="space-y-2">
        ${overview.gender ? `<li class="text-gray-700 text-sm"><strong class="font-semibold text-amber-800">性别</strong>：${overview.gender}</li>` : ''}
        ${overview.birthTime ? `<li class="text-gray-700 text-sm"><strong class="font-semibold text-amber-800">出生时间</strong>：${overview.birthTime}</li>` : ''}
        ${overview.bazi ? `<li class="text-gray-700 text-sm"><strong class="font-semibold text-amber-800">四柱八字</strong>：${overview.bazi}</li>` : ''}
        ${overview.ziwei ? `<li class="text-gray-700 text-sm"><strong class="font-semibold text-amber-800">紫微主星</strong>：${overview.ziwei}</li>` : ''}
        ${overview.handType ? `<li class="text-gray-700 text-sm"><strong class="font-semibold text-amber-800">手型</strong>：${overview.handType}</li>` : ''}
      </ul>
    </div>
  `;
}

/**
 * 生成分析报告部分的HTML
 */
export function generateAnalysisHTML(analysis: KnowledgeCardData['analysis']): string {
  if (!analysis.personality && !analysis.talents && !analysis.growth) {
    return '';
  }

  let html = '<div class="mb-6">';
  
  if (analysis.personality) {
    html += convertMarkdownToHTML(analysis.personality);
  }
  
  if (analysis.talents) {
    html += convertMarkdownToHTML(analysis.talents);
  }
  
  if (analysis.growth) {
    html += convertMarkdownToHTML(analysis.growth);
  }
  
  html += '</div>';
  
  return html;
}

/**
 * 生成建议部分的HTML
 */
export function generateSuggestionsHTML(suggestions: KnowledgeCardData['suggestions']): string {
  if (!suggestions.location && !suggestions.education && !suggestions.interests && !suggestions.career) {
    return '';
  }

  let html = '<div class="mb-6">';
  
  if (suggestions.location) {
    html += convertMarkdownToHTML(suggestions.location);
  }
  
  if (suggestions.education) {
    html += convertMarkdownToHTML(suggestions.education);
  }
  
  if (suggestions.interests) {
    html += convertMarkdownToHTML(suggestions.interests);
  }
  
  if (suggestions.career) {
    html += convertMarkdownToHTML(suggestions.career);
  }
  
  html += '</div>';
  
  return html;
}

/**
 * 生成结语部分的HTML
 */
export function generateConclusionHTML(conclusion: string): string {
  if (!conclusion) {
    return '';
  }

  return `
    <div class="mb-6">
      ${convertMarkdownToHTML(conclusion)}
    </div>
  `;
}

/**
 * 将Markdown转换为HTML并添加样式
 */
function convertMarkdownToHTML(markdown: string): string {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  try {
    // 预处理Markdown，确保标题格式正确
    const processedMarkdown = preprocessMarkdown(markdown);
    
    // 使用marked库转换
    const html = marked.parse(processedMarkdown) as string;
    
    // 添加样式类
    return addKnowledgeCardStyles(html);
  } catch (error) {
    console.error("Markdown转换失败:", error);
    return `<div class="whitespace-pre-wrap">${markdown}</div>`;
  }
}

/**
 * 预处理Markdown，确保标题格式正确
 */
function preprocessMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  let processed = markdown;

  // 处理分隔符+标题的格式
  // 例如：---### 二、 天赋挖掘与成长建议
  processed = processed.replace(/^---\s*(#{1,6}\s*[^\n]+)/gm, '---\n$1');
  
  // 特别处理 "---### 【玄机子大师结语】" 格式
  processed = processed.replace(/^---\s*(#{1,6}\s*【[^】]+】)/gm, '---\n$1');
  
  // 处理行内分隔符+标题格式（不在行首的情况）
  processed = processed.replace(/(\s+)---\s*(#{1,6}\s*[^\n]+)/gm, '$1---\n$2');
  
  // 特别处理 "---## 一、 核心命理分析报告" 格式
  processed = processed.replace(/^---\s*(#{1,6}\s*一、\s*[^\n]+)/gm, '---\n$1');
  
  // 处理标题和内容连在一起的情况
  // 例如：---## 国学课程推荐根据命盘特质与天赋分析
  processed = processed.replace(/^---\s*(#{1,6}\s*[^#\n]+)([^#\n]{10,})/gm, (match, title, content) => {
    // 如果内容部分很长，可能是标题和内容连在一起
    if (content.length > 20) {
      return `---\n${title}\n${content}`;
    }
    return match;
  });
  
  // 处理手型字段后直接连Markdown标题的情况
  // 例如：手型：待补充（需手相照片分析）## 一、 核心命理分析报告#### 1. 性格特质与教养指南
  processed = processed.replace(/(手型[：:][^#\n]*?)(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, '$1\n$2\n$3');
  processed = processed.replace(/(手型[：:][^#\n]*?)(#{1,6}[^#\n]+)/g, '$1\n$2');
  
  // 处理标题后面直接跟内容的情况
  // 例如：### 1. 儿童篆刻趣味启蒙班（首选）根据命盘特质
  processed = processed.replace(/^(#{1,6}\s*[^\n]+)([^#\n]{10,})/gm, (match, title, content) => {
    // 如果内容部分很长且不包含Markdown标记，可能是标题和内容连在一起
    if (content.length > 20 && !content.includes('*') && !content.includes('#')) {
      return `${title}\n${content}`;
    }
    return match;
  });

  return processed;
}

/**
 * 为知识卡片内容添加样式类
 */
function addKnowledgeCardStyles(html: string): string {
  if (!html) {
    return "";
  }

  return html
    // 标题样式
    .replace(/<h1>/g, '<h1 class="text-2xl font-bold text-amber-900 mb-4 mt-6 first:mt-0 tracking-wide">')
    .replace(/<h2>/g, '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">')
    .replace(/<h3>/g, '<h3 class="text-lg font-semibold text-amber-800 mb-2 mt-4 first:mt-0 tracking-wide">')
    .replace(/<h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">')
    .replace(/<h5>/g, '<h5 class="text-sm font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">')
    .replace(/<h6>/g, '<h6 class="text-xs font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">')
    // 段落样式
    .replace(/<p>/g, '<p class="mb-3 text-gray-700 leading-relaxed text-sm">')
    // 列表样式
    .replace(/<ul>/g, '<ul class="mb-4 ml-6 space-y-2 list-disc">')
    .replace(/<ol>/g, '<ol class="mb-4 ml-6 space-y-2 list-decimal">')
    .replace(/<li>/g, '<li class="text-gray-700 text-sm leading-relaxed pl-1">')
    // 强调文本样式
    .replace(/<strong>/g, '<strong class="font-semibold text-amber-800">')
    .replace(/<em>/g, '<em class="italic text-amber-700">')
    // 分隔线样式
    .replace(/<hr>/g, '<hr class="my-6 border-t border-amber-300">');
}

/**
 * 清理Coze返回中的噪声
 */
function cleanCozeNoise(original: string): string {
  if (!original) return '';
  const lines = original.split(/\r?\n/);
  const cleaned: string[] = [];
  const noisePatterns = [
    /RPCError\{/,
    /PSM:\[/,
    /BizStatusCode:\[/,
    /BizStatusMessage:\[/,
    /OriginalErr:\[/,
    /Method:\[/,
  ];
  for (const line of lines) {
    if (noisePatterns.some((p) => p.test(line))) continue;
    cleaned.push(line);
  }
  return cleaned.join('\n').trim();
}

/**
 * 生成剩余内容的HTML（分析报告部分）
 */
export function generateRemainingContentHTML(rawContent: string): string {
  console.log('开始生成剩余内容HTML...');
  console.log('原始内容:', rawContent.substring(0, 200) + '...');
  
  // 分离概览部分和剩余内容
  const { remainingContent } = separateOverviewFromContent(rawContent);
  
  console.log('分离后的剩余内容:', remainingContent.substring(0, 200) + '...');
  
  if (!remainingContent) {
    console.log('没有剩余内容');
    return '';
  }
  
  // 处理Markdown标题转换
  const processedContent = processMarkdownTitles(remainingContent);
  console.log('处理后的内容:', processedContent.substring(0, 200) + '...');
  
  // 转换为HTML并添加样式
  const html = convertMarkdownToHTML(processedContent);
  console.log('转换后的HTML:', html.substring(0, 200) + '...');
  
  console.log('剩余内容HTML生成完成');
  return html;
}

/**
 * 处理Markdown标题，确保正确分离和转换
 */
function processMarkdownTitles(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  let processed = content;

  // 处理连在一起的Markdown内容，确保正确的换行分隔
  // 例如：---## 一、 核心命理分析报告#### 1. 性格特质与教养指南
  processed = processed.replace(/(---)(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, '$1\n$2\n$3');
  processed = processed.replace(/(---)(#{1,6}[^#\n]+)/g, '$1\n$2');
  processed = processed.replace(/(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, '$1\n$2');
  
  // 处理手型字段后直接连Markdown标题的情况
  // 例如：手型：待补充（需手相照片分析）## 一、 核心命理分析报告#### 1. 性格特质与教养指南
  processed = processed.replace(/(手型[：:][^#\n]*?)(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, '$1\n$2\n$3');
  processed = processed.replace(/(手型[：:][^#\n]*?)(#{1,6}[^#\n]+)/g, '$1\n$2');

  // 处理特殊的标题格式
  // 处理 "---### 二、 天赋挖掘与成长建议" 格式
  processed = processed.replace(/^---\s*(#{1,6}\s*[^\n]+)/gm, '---\n$1');
  
  // 处理 "---### 【玄机子大师结语】" 格式
  processed = processed.replace(/^---\s*(#{1,6}\s*【[^】]+】)/gm, '---\n$1');
  
  // 特别处理 "---## 一、 核心命理分析报告" 格式
  processed = processed.replace(/^---\s*(#{1,6}\s*一、\s*[^\n]+)/gm, '---\n$1');
  
  // 再次确保所有分隔符+标题格式都被正确处理
  processed = processed.replace(/^---\s*(#{1,6}\s*[^\n]+)/gm, '---\n$1');
  
  // 处理行内分隔符+标题格式（不在行首的情况）
  processed = processed.replace(/(\s+)---\s*(#{1,6}\s*[^\n]+)/gm, '$1---\n$2');
  
  // 处理 "---## 国学课程推荐根据命盘特质与天赋分析" 格式
  // 这种格式是标题和内容连在一起，需要分离
  processed = processed.replace(/^---\s*(#{1,6}\s*[^#\n]+)([^#\n]+)/gm, (match, title, content) => {
    // 如果内容部分很长，可能是标题和内容连在一起
    if (content.length > 20) {
      return `---\n${title}\n${content}`;
    }
    return match;
  });
  
  // 处理 "### 1. 儿童篆刻趣味启蒙班（首选）" 格式
  processed = processed.replace(/^(#{1,6}\s*\d+\.\s*[^\n]+)/gm, '$1');
  
  // 处理其他可能的连在一起的情况
  // 例如：标题后面直接跟内容，没有换行
  processed = processed.replace(/^(#{1,6}\s*[^\n]+)([^#\n]{10,})/gm, (match, title, content) => {
    // 如果内容部分很长且不包含Markdown标记，可能是标题和内容连在一起
    if (content.length > 20 && !content.includes('*') && !content.includes('#')) {
      return `${title}\n${content}`;
    }
    return match;
  });

  return processed;
}

/**
 * 生成完整的知识卡片HTML
 */
export function generateKnowledgeCardHTML(rawContent: string): string {
  console.log('开始生成知识卡片HTML...');
  
  // 提取结构化数据
  const cardData = extractKnowledgeCardData(rawContent);
  
  // 生成各部分HTML
  const overviewHTML = generateOverviewHTML(cardData.overview);
  const analysisHTML = generateAnalysisHTML(cardData.analysis);
  const suggestionsHTML = generateSuggestionsHTML(cardData.suggestions);
  const conclusionHTML = generateConclusionHTML(cardData.conclusion);
  
  // 组合完整HTML
  const fullHTML = `
    <div class="knowledge-card-content">
      ${overviewHTML}
      ${analysisHTML}
      ${suggestionsHTML}
      ${conclusionHTML}
    </div>
  `;
  
  console.log('知识卡片HTML生成完成');
  return fullHTML;
}
