import { marked } from "marked";

/**
 * 配置marked选项
 */
marked.setOptions({
  breaks: true, // 支持换行符
  gfm: true, // 支持GitHub风格的markdown
});

/**
 * 智能解析Markdown标题，处理同一行中的多个标题层级
 * @param text - 包含Markdown符号的文本
 * @returns 解析后的HTML字符串
 */
export function parseMarkdownTitles(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  let processed = text;
  
  // 处理同一行中的多个标题：##一、核心命理分析报告####1.性格特质与教养指南(天性之根)
  // 将其拆分为独立的标题行
  processed = processed.replace(/^(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)$/gm, (match, title1, title2) => {
    return `${title1}\n${title2}`;
  });
  
  // 处理更复杂的情况：可能有多个标题在同一行
  processed = processed.replace(/^(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)$/gm, (match, title1, title2, title3) => {
    return `${title1}\n${title2}\n${title3}`;
  });
  
  return processed;
}

/**
 * 清理Markdown符号，转换为正常文本
 * @param text - 包含Markdown符号的文本
 * @returns 清理后的正常文本
 */
export function cleanMarkdownSymbols(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  let cleaned = text;
  
  // 清理标题符号
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, ''); // 移除行首的 # 符号
  cleaned = cleaned.replace(/^#{1,6}\s*【[^】]+】\s*$/gm, (match) => {
    // 保留中文标题内容，只移除 # 符号
    return match.replace(/^#{1,6}\s*/, '');
  });
  
  // 清理分隔线
  cleaned = cleaned.replace(/^---+$/gm, ''); // 移除单独的分隔线行
  cleaned = cleaned.replace(/^---+/gm, ''); // 移除行首的分隔线
  
  // 清理列表符号
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, ''); // 移除无序列表符号
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ''); // 移除有序列表符号
  
  // 清理粗体和斜体符号
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // 移除粗体符号
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // 移除斜体符号
  
  // 清理代码符号
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // 移除行内代码符号
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ''); // 移除代码块
  
  // 清理引用符号
  cleaned = cleaned.replace(/^\s*>\s+/gm, ''); // 移除引用符号
  
  // 清理多余的空行
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // 将多个空行合并为两个
  
  return cleaned.trim();
}

/**
 * 将markdown文本转换为HTML
 * @param markdown - markdown格式的文本
 * @returns HTML字符串
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  try {
    const parsed = marked.parse(markdown) as unknown as string;
    return parsed;
  } catch (error) {
    console.error("Markdown转换失败:", error);
    // 如果转换失败，返回原始文本的HTML格式
    return `<div class="whitespace-pre-wrap">${markdown}</div>`;
  }
}

/**
 * 检测文本是否为markdown格式
 * @param text - 要检测的文本
 * @returns 是否为markdown格式
 */
export function isMarkdownFormat(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  // 检测常见的markdown标记，支持中文内容
  const markdownPatterns = [
    /^#{1,6}\s+.+/m, // 标题（支持中文）
    /^#{1,6}\s*【[^】]+】\s*$/m, // 中文标题（如：## 【命主信息概览】）
    /\*\*[^*]+\*\*/, // 粗体
    /\*[^*]+\*/, // 斜体（但不是列表）
    /^\s*[-*+]\s+.+/m, // 无序列表
    /^\s*\d+\.\s+.+/m, // 有序列表
    /^\s*>\s+.+/m, // 引用
    /```[\s\S]*?```/, // 代码块
    /`[^`]+`/, // 行内代码
    /\[[^\]]+\]\([^)]+\)/, // 链接
    /^---+$/m, // 分隔线
    /^\s*\*\s+\*\*[^*]+\*\*/, // 列表项中的粗体（如：* **性别**：男）
    /^####\s+.+/m, // 四级标题
    /^###\s+.+/m, // 三级标题
    /^##\s+.+/m, // 二级标题
    /^#\s+.+/m, // 一级标题
  ];

  // 检查是否包含多个markdown特征
  const matchCount = markdownPatterns.filter(pattern => pattern.test(text)).length;
  
  // 如果包含多个markdown特征，或者包含明显的markdown结构，则认为是markdown
  return matchCount >= 2 || 
         /^#{1,6}\s+.+/m.test(text) || // 包含标题
         /^\s*[-*+]\s+.+/m.test(text) || // 包含列表
         /```[\s\S]*?```/.test(text); // 包含代码块
}

/**
 * 错误内容映射：将技术性错误信息映射为用户友好的提示
 * @param content - 原始内容
 * @returns 映射后的内容
 */
export function mapErrorContent(content: string): string {
  if (!content || typeof content !== "string") {
    return content;
  }

  // 手相识别失败的错误映射
  const errorMappings = [
    {
      // 匹配包含手相相关错误信息的内容
      pattern: /您好，目前无法获取手相照片信息，可能是文件ID有误或系统暂时无法读取。为了更精准地完成"天地双盘\+手相，参合互证"的深度分析，能否请您重新确认或提供有效的手相照片信息？\s*重新提供一下手相照片的文件\s*ID。\s*不考虑手相的话，能否对孩子进行命理分析？\s*除了手相和天地双盘，还有哪些命理分析方法？/,
      replacement: "暂时无法获取手相信息，请您点击刷新后重试！"
    },
    {
      // 匹配手相分析功能需要具体特征描述的错误
      pattern: /您好，目前手相分析功能需要您提供手相的具体特征描述（如掌形、纹路特点等），而非文件ID。请您帮忙描述一下孩子手相的特征，比如掌形是方形、细长形还是其他形状？三大主纹（生命线、智慧线、感情线）是否清晰深刻？是否有特殊纹路或标记？这样我才能结合八字和紫微斗数为您进行全面的"天地双盘\+手相"分析。\s*请描述一下这个孩子的掌形和手指形状。\s*这个孩子的手相上有哪些特殊的纹路或标记？\s*他的智慧线和感情线有什么特点？/,
      replacement: "暂时无法获取手相信息，请您点击刷新后重试！"
    },
    {
      // 匹配其他手相相关的错误信息
      pattern: /无法获取手相照片信息|文件ID有误|系统暂时无法读取.*手相|手相分析功能需要您提供手相的具体特征描述/,
      replacement: "暂时无法获取手相信息，请您点击刷新后重试！"
    }
  ];

  let mappedContent = content;
  
  // 应用错误映射
  for (const mapping of errorMappings) {
    if (mapping.pattern.test(mappedContent)) {
      console.log('检测到手相错误信息，进行映射:', mapping.pattern);
      mappedContent = mappedContent.replace(mapping.pattern, mapping.replacement);
      break; // 只应用第一个匹配的映射
    }
  }

  return mappedContent;
}

/**
 * 修复混合在HTML标签中的Markdown标题
 * 专门处理<li>标签内包含Markdown标题的复杂情况
 * @param html - HTML字符串
 * @returns 修复后的HTML字符串
 */
export function fixMixedMarkdownTitles(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  let processed = html;

  // 处理li标签内包含标题的情况
  // 匹配模式：<li>...内容...---## 标题#### 子标题</li>
  processed = processed.replace(
    /<li>([^<]*(?:<[^>]+>[^<]*)*?)(---#{1,6}[^<]+)<\/li>/g,
    (match, content, titles) => {
      // 分离内容和标题
      const cleanContent = content.trim();
      const titleLines = titles.split(/(?=#{1,6})/).filter(line => line.trim());

      // 构建新的HTML结构
      let result = '';
      if (cleanContent) {
        result += `<li>${cleanContent}</li>`;
      }

      // 添加标题
      titleLines.forEach(titleLine => {
        const trimmed = titleLine.trim();
        if (trimmed) {
          result += `\n${trimmed}`;
        }
      });

      return result;
    }
  );

  // 处理li标签内包含单个标题的情况
  // 匹配模式：<li>...内容...#### 标题</li>
  processed = processed.replace(
    /<li>([^<]*(?:<[^>]+>[^<]*)*?)(#{1,6}[^<]+)<\/li>/g,
    (match, content, title) => {
      const cleanContent = content.trim();
      const cleanTitle = title.trim();

      let result = '';
      if (cleanContent) {
        result += `<li>${cleanContent}</li>`;
      }
      if (cleanTitle) {
        result += `\n${cleanTitle}`;
      }

      return result;
    }
  );

  // 处理分隔线和标题的组合
  // 匹配模式：---## 标题#### 子标题
  processed = processed.replace(
    /(---#{1,6}[^\n]+)/g,
    (match) => {
      // 将分隔线和标题分离
      const parts = match.split(/(?=#{1,6})/);
      let result = '';

      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed) {
          if (trimmed.startsWith('---')) {
            result += '\n---\n';
          } else if (trimmed.startsWith('#')) {
            result += `\n${trimmed}`;
          }
        }
      });

      return result;
    }
  );

  return processed;
}

/**
 * 增强的混合Markdown标题修复函数
 * 专门处理复杂的li标签内混合标题情况
 * @param html - HTML字符串
 * @returns 修复后的HTML字符串
 */
export function fixComplexMixedTitles(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  let processed = html;

  // 处理li标签内混合了普通文本和多个Markdown标题的复杂情况
  // 匹配模式：<li>...内容...## 标题#### 子标题</li>
  processed = processed.replace(
    /<li>([^<]*(?:<[^>]+>[^<]*)*?)(#{1,6}[^#\n]*(?:#{1,6}[^#\n]*)*)<\/li>/g,
    (match, content, titles) => {
      const cleanContent = content.trim();
      
      // 分离多个标题
      const titleMatches = titles.match(/#{1,6}[^#\n]+/g) || [];
      
      let result = '';
      
      // 保留原始内容（如果存在）
      if (cleanContent) {
        result += `<li>${cleanContent}</li>`;
      }
      
      // 添加分离出的标题
      titleMatches.forEach(title => {
        const trimmed = title.trim();
        if (trimmed) {
          result += `\n${trimmed}`;
        }
      });
      
      return result;
    }
  );

  // 处理更复杂的情况：li标签内包含多个连续的标题
  // 匹配模式：<li>...内容...## 标题#### 子标题### 另一个标题</li>
  processed = processed.replace(
    /<li>([^<]*(?:<[^>]+>[^<]*)*?)(#{1,6}[^<]*(?:#{1,6}[^<]*)*)<\/li>/g,
    (match, content, titles) => {
      const cleanContent = content.trim();
      
      // 使用更精确的正则表达式分离标题
      const titlePattern = /#{1,6}[^#\n]+/g;
      const titleMatches = titles.match(titlePattern) || [];
      
      let result = '';
      
      if (cleanContent) {
        result += `<li>${cleanContent}</li>`;
      }
      
      titleMatches.forEach(title => {
        const trimmed = title.trim();
        if (trimmed) {
          result += `\n${trimmed}`;
        }
      });
      
      return result;
    }
  );

  return processed;
}

/**
 * AI辅助的智能文本格式转换
 * 使用高级文本分析来处理最复杂的混合格式情况
 * @param html - HTML字符串
 * @returns 修复后的HTML字符串
 */
export function aiAssistedFormatFix(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  let processed = html;

  // 使用更智能的方法处理li标签内的复杂混合内容
  // 这个方法会分析文本结构，识别标题模式，并正确分离
  processed = processed.replace(
    /<li>([^<]*(?:<[^>]+>[^<]*)*?)(#{1,6}[^<]+)<\/li>/g,
    (match, content, titles) => {
      const cleanContent = content.trim();
      
      // 分析标题部分，分离出所有可能的标题
      const titleAnalysis = analyzeTitleStructure(titles);
      
      let result = '';
      
      // 保留原始内容（如果存在且不是空的）
      if (cleanContent && cleanContent.length > 0) {
        result += `<li>${cleanContent}</li>`;
      }
      
      // 添加分离出的标题，按层级排序
      titleAnalysis.forEach(title => {
        if (title.trim()) {
          result += `\n${title.trim()}`;
        }
      });
      
      return result;
    }
  );

  return processed;
}

/**
 * 分析标题结构，分离出所有标题
 * @param titleText - 包含标题的文本
 * @returns 分离后的标题数组
 */
function analyzeTitleStructure(titleText: string): string[] {
  if (!titleText || typeof titleText !== "string") {
    return [];
  }

  const titles: string[] = [];
  
  // 使用更精确的正则表达式来匹配标题
  // 匹配模式：# 标题内容（不包含换行符）
  const titlePattern = /#{1,6}[^#\n]+/g;
  let match;
  
  while ((match = titlePattern.exec(titleText)) !== null) {
    const title = match[0].trim();
    if (title) {
      titles.push(title);
    }
  }
  
  // 如果没有找到标准格式的标题，尝试其他模式
  if (titles.length === 0) {
    // 尝试匹配没有空格的标题格式：##标题
    const noSpacePattern = /#{1,6}[^#\n\s]+/g;
    while ((match = noSpacePattern.exec(titleText)) !== null) {
      const title = match[0].trim();
      if (title) {
        titles.push(title);
      }
    }
  }
  
  return titles;
}

/**
 * 通用Markdown标题转换函数
 * 将任何Markdown格式的标题转换为对应的HTML标题
 * @param content - 包含Markdown标题的内容
 * @returns 转换后的HTML字符串
 */
export function convertMarkdownTitlesToHtml(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  let processed = content;

  // 处理各种级别的Markdown标题
  // H1标题
  processed = processed.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold text-amber-900 mb-4 mt-6 first:mt-0 tracking-wide">$1</h1>');
  
  // H2标题
  processed = processed.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">$1</h2>');
  
  // H3标题
  processed = processed.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-semibold text-amber-800 mb-2 mt-4 first:mt-0 tracking-wide">$1</h3>');
  
  // H4标题
  processed = processed.replace(/^####\s+(.+)$/gm, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">$1</h4>');
  
  // H5标题
  processed = processed.replace(/^#####\s+(.+)$/gm, '<h5 class="text-sm font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">$1</h5>');
  
  // H6标题
  processed = processed.replace(/^######\s+(.+)$/gm, '<h6 class="text-xs font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">$1</h6>');

  return processed;
}

/**
 * 增强的Markdown标题处理函数
 * 能够处理混合在同一行中的多个标题
 * @param content - 包含Markdown标题的内容
 * @returns 转换后的HTML字符串
 */
export function processMixedMarkdownTitles(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  let processed = content;

  // 首先检查是否真的存在混合标题（同一行中有多个标题）
  // 如果内容已经正确换行，直接使用标准转换
  const hasMixedTitles = /#{1,6}[^#\n]+#{1,6}[^#\n]+/.test(processed);
  
  if (!hasMixedTitles) {
    // 没有混合标题，直接使用标准Markdown转换
    return convertMarkdownTitlesToHtml(processed);
  }

  // 只有在确实存在混合标题时才进行特殊处理
  console.log('检测到混合标题，进行特殊处理');

  // 处理分隔符+标题的混合情况
  // 例如：---## 一、核心命理分析报告### 1. 性格特质与教养指南 (天性之根)
  processed = processed.replace(/(---\s*)(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, (match, separator, title1, title2) => {
    const h1Level = (title1.match(/#/g) || []).length;
    const h2Level = (title2.match(/#/g) || []).length;
    
    const h1Html = convertSingleTitle(title1, h1Level);
    const h2Html = convertSingleTitle(title2, h2Level);
    
    return `${separator}\n${h1Html}\n${h2Html}`;
  });

  // 处理分隔符+单个标题的情况
  // 例如：---## 一、核心命理分析报告
  processed = processed.replace(/(---\s*)(#{1,6}[^#\n]+)/g, (match, separator, title) => {
    const level = (title.match(/#/g) || []).length;
    const titleHtml = convertSingleTitle(title, level);
    
    return `${separator}\n${titleHtml}`;
  });

  // 处理行内混合标题的情况
  // 例如：内容##一、核心命理分析报告###1.性格特质与教养指南(天性之根)
  processed = processed.replace(/([^#\n])(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, (match, prefix, title1, title2) => {
    const h1Level = (title1.match(/#/g) || []).length;
    const h2Level = (title2.match(/#/g) || []).length;
    
    const h1Html = convertSingleTitle(title1, h1Level);
    const h2Html = convertSingleTitle(title2, h2Level);
    
    return `${prefix}\n${h1Html}\n${h2Html}`;
  });

  // 处理行首混合标题的情况
  // 例如：##一、核心命理分析报告###1.性格特质与教养指南(天性之根)
  processed = processed.replace(/^(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/gm, (match, title1, title2) => {
    const h1Level = (title1.match(/#/g) || []).length;
    const h2Level = (title2.match(/#/g) || []).length;
    
    const h1Html = convertSingleTitle(title1, h1Level);
    const h2Html = convertSingleTitle(title2, h2Level);
    
    return `${h1Html}\n${h2Html}`;
  });

  // 处理三个标题在同一行的情况
  processed = processed.replace(/(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, (match, title1, title2, title3) => {
    const h1Level = (title1.match(/#/g) || []).length;
    const h2Level = (title2.match(/#/g) || []).length;
    const h3Level = (title3.match(/#/g) || []).length;
    
    const h1Html = convertSingleTitle(title1, h1Level);
    const h2Html = convertSingleTitle(title2, h2Level);
    const h3Html = convertSingleTitle(title3, h3Level);
    
    return `${h1Html}\n${h2Html}\n${h3Html}`;
  });

  // 处理剩余的单个标题
  processed = convertMarkdownTitlesToHtml(processed);

  return processed;
}

/**
 * 转换单个标题为HTML
 * @param title - 标题文本
 * @param level - 标题级别
 * @returns HTML字符串
 */
function convertSingleTitle(title: string, level: number): string {
  const cleanTitle = title.replace(/^#+\s*/, '').trim();
  
  const classMap = {
    1: 'text-2xl font-bold text-amber-900 mb-4 mt-6 first:mt-0 tracking-wide',
    2: 'text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide',
    3: 'text-lg font-semibold text-amber-800 mb-2 mt-4 first:mt-0 tracking-wide',
    4: 'text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide',
    5: 'text-sm font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide',
    6: 'text-xs font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide'
  };
  
  const className = classMap[level as keyof typeof classMap] || classMap[4];
  
  return `<h${level} class="${className}">${cleanTitle}</h${level}>`;
}

/**
 * 专门处理知识卡输出格式的Markdown标题转换
 * 根据outputformat.md的格式规范，将特定格式的标题转换为正确的HTML
 * @param content - 包含知识卡格式的内容
 * @returns 转换后的HTML字符串
 */
export function processKnowledgeCardFormat(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  console.log('processKnowledgeCardFormat 处理内容:', content.substring(0, 200) + '...');

  let processed = content;

  // 首先处理转义字符，确保换行符被正确识别
  processed = processed.replace(/\\n/g, '\n');
  processed = processed.replace(/\\"/g, '"');
  processed = processed.replace(/\\t/g, '\t');

  // 处理连在一起的Markdown内容，确保正确的换行分隔
  // 例如：---## 一、 核心命理分析报告#### 1. 性格特质与教养指南
  processed = processed.replace(/(---)(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, '$1\n$2\n$3');
  processed = processed.replace(/(---)(#{1,6}[^#\n]+)/g, '$1\n$2');
  processed = processed.replace(/(#{1,6}[^#\n]+)(#{1,6}[^#\n]+)/g, '$1\n$2');
  
  // 特别处理概览部分，确保在分隔符处截断
  // 如果概览部分包含分隔符和后续内容，只保留概览部分
  const overviewMatch = processed.match(/^([^]*?【命主信息概览】[^]*?手型[^]*?)(---.*)/s);
  if (overviewMatch) {
    const overviewPart = overviewMatch[1].trim();
    const restPart = overviewMatch[2];
    console.log('分离概览部分:', overviewPart);
    console.log('剩余部分:', restPart.substring(0, 100) + '...');
    // 只处理概览部分，其余部分单独处理
    processed = overviewPart;
  }

  // 然后使用增强的混合Markdown标题处理
  processed = processMixedMarkdownTitles(processed);

  // 然后处理特殊的知识卡格式
  // 1. 处理【命主信息概览】格式 - 确保正确的样式
  processed = processed.replace(/<h2[^>]*>【命主信息概览】<\/h2>/g, '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">【命主信息概览】</h2>');
  processed = processed.replace(/<h2[^>]*>命主信息概览<\/h2>/g, '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">【命主信息概览】</h2>');
  
  // 2. 处理一级标题 - 确保正确的样式
  processed = processed.replace(/<h2[^>]*>一、\s*核心命理分析报告<\/h2>/g, '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">一、 核心命理分析报告</h2>');
  processed = processed.replace(/<h2[^>]*>核心命理分析报告<\/h2>/g, '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">一、 核心命理分析报告</h2>');
  
  processed = processed.replace(/<h2[^>]*>二、\s*天赋挖掘与成长建议<\/h2>/g, '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">二、 天赋挖掘与成长建议</h2>');
  processed = processed.replace(/<h2[^>]*>天赋挖掘与成长建议<\/h2>/g, '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">二、 天赋挖掘与成长建议</h2>');
  
  // 3. 处理二级标题 - 确保正确的样式
  processed = processed.replace(/<h3[^>]*>【玄机子大师结语】<\/h3>/g, '<h3 class="text-lg font-semibold text-amber-800 mb-2 mt-4 first:mt-0 tracking-wide">【玄机子大师结语】</h3>');
  processed = processed.replace(/<h3[^>]*>玄机子大师结语<\/h3>/g, '<h3 class="text-lg font-semibold text-amber-800 mb-2 mt-4 first:mt-0 tracking-wide">【玄机子大师结语】</h3>');
  
  // 4. 处理三级标题 - 确保正确的样式
  processed = processed.replace(/<h4[^>]*>1\.\s*性格特质与教养指南\s*\(天性之根\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">1. 性格特质与教养指南 (天性之根)</h4>');
  processed = processed.replace(/<h4[^>]*>性格特质与教养指南\s*\(天性之根\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">1. 性格特质与教养指南 (天性之根)</h4>');
  processed = processed.replace(/<h4[^>]*>性格特质与教养指南<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">1. 性格特质与教养指南 (天性之根)</h4>');
  
  processed = processed.replace(/<h4[^>]*>2\.\s*潜在天赋深掘\s*\(天赋之苗\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">2. 潜在天赋深掘 (天赋之苗)</h4>');
  processed = processed.replace(/<h4[^>]*>潜在天赋深掘\s*\(天赋之苗\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">2. 潜在天赋深掘 (天赋之苗)</h4>');
  processed = processed.replace(/<h4[^>]*>潜在天赋深掘<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">2. 潜在天赋深掘 (天赋之苗)</h4>');
  
  processed = processed.replace(/<h4[^>]*>3\.\s*成长关键节点\s*\(成长之路\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">3. 成长关键节点 (成长之路)</h4>');
  processed = processed.replace(/<h4[^>]*>成长关键节点\s*\(成长之路\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">3. 成长关键节点 (成长之路)</h4>');
  processed = processed.replace(/<h4[^>]*>成长关键节点<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">3. 成长关键节点 (成长之路)</h4>');
  
  // 5. 处理天赋挖掘部分的四级标题
  processed = processed.replace(/<h4[^>]*>1\.\s*地域适配建议\s*\(地利之选\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">1. 地域适配建议 (地利之选)</h4>');
  processed = processed.replace(/<h4[^>]*>地域适配建议\s*\(地利之选\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">1. 地域适配建议 (地利之选)</h4>');
  processed = processed.replace(/<h4[^>]*>地域适配建议<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">1. 地域适配建议 (地利之选)</h4>');
  
  processed = processed.replace(/<h4[^>]*>2\.\s*学业方向指引\s*\(文理之道\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">2. 学业方向指引 (文理之道)</h4>');
  processed = processed.replace(/<h4[^>]*>学业方向指引\s*\(文理之道\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">2. 学业方向指引 (文理之道)</h4>');
  processed = processed.replace(/<h4[^>]*>学业方向指引<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">2. 学业方向指引 (文理之道)</h4>');
  
  processed = processed.replace(/<h4[^>]*>3\.\s*兴趣培养清单\s*\(怡情之艺\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">3. 兴趣培养清单 (怡情之艺)</h4>');
  processed = processed.replace(/<h4[^>]*>兴趣培养清单\s*\(怡情之艺\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">3. 兴趣培养清单 (怡情之艺)</h4>');
  processed = processed.replace(/<h4[^>]*>兴趣培养清单<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">3. 兴趣培养清单 (怡情之艺)</h4>');
  
  processed = processed.replace(/<h4[^>]*>4\.\s*未来行业适配参考\s*\(成事之途\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">4. 未来行业适配参考 (成事之途)</h4>');
  processed = processed.replace(/<h4[^>]*>未来行业适配参考\s*\(成事之途\)<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">4. 未来行业适配参考 (成事之途)</h4>');
  processed = processed.replace(/<h4[^>]*>未来行业适配参考<\/h4>/g, '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">4. 未来行业适配参考 (成事之途)</h4>');
  
  // 6. 处理分隔线（包括混合在标题中的情况）
  processed = processed.replace(/^---\s*$/gm, '<hr class="my-6 border-t border-amber-300">');
  // 处理分隔符+标题的情况，确保分隔符被正确识别
  processed = processed.replace(/^---\s*(#{1,6}[^#\n]+)/gm, (match, title) => {
    const level = (title.match(/#/g) || []).length;
    const titleHtml = convertSingleTitle(title, level);
    return `<hr class="my-6 border-t border-amber-300">\n${titleHtml}`;
  });
  
  // 7. 处理列表项中的粗体格式（支持多种变体）
  processed = processed.replace(/\*\s*\*\*([^*]+)\*\*\s*[：:]/g, '<li class="text-gray-700 text-sm leading-relaxed pl-1"><strong class="font-semibold text-amber-800">$1</strong>：');
  processed = processed.replace(/^\*\s*\*\*([^*]+)\*\*\s*[：:]/gm, '<li class="text-gray-700 text-sm leading-relaxed pl-1"><strong class="font-semibold text-amber-800">$1</strong>：');
  
  // 8. 处理段落内容
  const lines = processed.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    
    // 跳过已经是HTML标签的行
    if (trimmed.startsWith('<h') || trimmed.startsWith('<hr') || trimmed.startsWith('<li')) {
      return line;
    }
    
    // 跳过空行
    if (!trimmed) {
      return '<br>';
    }
    
    // 处理普通段落
    return `<p class="mb-3 text-gray-700 leading-relaxed text-sm">${trimmed}</p>`;
  });
  
  processed = processedLines.join('\n');
  
  // 9. 包装在容器中
  processed = `<div class="knowledge-card-content">${processed}</div>`;
  
  console.log('知识卡格式处理完成');
  return processed;
}

/**
 * 智能内容处理：自动检测格式并转换（展示所有content数据，不过滤）
 * @param content - 内容文本
 * @returns 处理后的HTML字符串
 */
export function smartContentProcess(content: string): string {
  if (!content) {
    return "";
  }

  console.log('smartContentProcess 接收到的原始内容:', content);

  // 首先进行错误内容映射
  const errorMappedContent = mapErrorContent(content);
  if (errorMappedContent !== content) {
    console.log('错误内容映射完成:', errorMappedContent);
  }

  // 如果内容已经是HTML格式（包含HTML标签），直接返回
  if (errorMappedContent.includes("<") && errorMappedContent.includes(">")) {
    console.log('检测到HTML格式，直接返回');
    return errorMappedContent;
  }

  // 预处理内容，处理JSON格式的扣子返回数据
  let processedContent = errorMappedContent;
  
  // 尝试解析JSON格式的扣子返回数据
  try {
    // 检查是否为JSON格式
    if (errorMappedContent.trim().startsWith('{') && errorMappedContent.trim().endsWith('}')) {
      const jsonData = JSON.parse(errorMappedContent);
      console.log('解析到JSON数据:', jsonData);
      
      // 处理扣子返回的JSON数据，优先提取主要内容
      if (jsonData.msg_type && jsonData.data) {
        processedContent = jsonData.data;
        console.log('提取JSON中的data字段:', processedContent);
      } else if (jsonData.wrapped_text) {
        processedContent = jsonData.wrapped_text;
        console.log('提取JSON中的wrapped_text字段:', processedContent);
      } else if (jsonData.content) {
        processedContent = jsonData.content;
        console.log('提取JSON中的content字段:', processedContent);
      } else {
        // 如果是其他JSON格式，保留完整的JSON内容以便展示
        processedContent = JSON.stringify(jsonData, null, 2);
        console.log('保留完整JSON格式展示');
      }
    }
  } catch (error) {
    // 如果不是有效JSON，继续使用原始内容
    console.log('非JSON格式内容，使用原始内容');
    processedContent = content;
  }
  
  // 仅处理基本的转义字符，保留所有原始内容
  processedContent = processedContent.replace(/\\n/g, '\n'); // 处理转义的换行符
  processedContent = processedContent.replace(/\\"/g, '"'); // 处理转义的引号
  processedContent = processedContent.replace(/\\t/g, '\t'); // 处理转义的制表符
  
  console.log('处理转义字符后的内容:', processedContent);

  // 检测知识卡格式 - 优先使用专门的知识卡格式处理
  if (processedContent.includes('【命主信息概览】') || 
      processedContent.includes('核心命理分析报告') ||
      processedContent.includes('天赋挖掘与成长建议') ||
      processedContent.includes('玄机子大师结语') ||
      processedContent.includes('性格特质与教养指南') ||
      processedContent.includes('潜在天赋深掘') ||
      processedContent.includes('成长关键节点') ||
      processedContent.includes('地域适配建议') ||
      processedContent.includes('学业方向指引') ||
      processedContent.includes('兴趣培养清单') ||
      processedContent.includes('未来行业适配参考') ||
      // 检测Markdown标题格式
      (processedContent.includes('##') && processedContent.includes('####'))) {
    
    console.log('检测到知识卡格式，使用专门处理');
    return processKnowledgeCardFormat(processedContent);
  }

  // 检测并处理Markdown格式
  if (isMarkdownFormat(processedContent) || 
      processedContent.includes('####') || processedContent.includes('###') || 
      processedContent.includes('##') || processedContent.includes('#') ||
      processedContent.includes('---')) {
    
    console.log('检测到Markdown格式，使用智能解析');
    
    // 方法1：先智能解析标题，再转换为HTML
    const parsedContent = parseMarkdownTitles(processedContent);
    console.log('智能解析标题后的内容:', parsedContent);
    
    // 使用marked库进行标准Markdown转换
    try {
      const html = markdownToHtml(parsedContent);
      console.log('Markdown转换后的HTML:', html);

      // 修复混合在HTML标签中的Markdown标题
      const fixedHtml = fixMixedMarkdownTitles(html);
      console.log('修复混合标题后的HTML:', fixedHtml);

      // 进一步修复复杂的混合标题情况
      const complexFixedHtml = fixComplexMixedTitles(fixedHtml);
      console.log('修复复杂混合标题后的HTML:', complexFixedHtml);

      // 使用AI辅助的智能格式修复处理最复杂的情况
      const aiFixedHtml = aiAssistedFormatFix(complexFixedHtml);
      console.log('AI辅助修复后的HTML:', aiFixedHtml);

      return addMarkdownStyles(aiFixedHtml);
    } catch (error) {
      console.error('Markdown转换失败，使用清理方法:', error);
      
      // 备用方法：清理符号后转换为段落
      const cleanedText = cleanMarkdownSymbols(processedContent);
      console.log('清理Markdown符号后的文本:', cleanedText);
      
      const html = cleanedText
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed) return '<br>'; // 空行转换为换行
          return `<p class="mb-3 text-gray-700 leading-relaxed text-sm">${trimmed}</p>`;
        })
        .join('');
      
      console.log('清理后转换的HTML:', html);
      return html;
    }
  }

  // 否则作为纯文本处理，保留换行和所有内容
  console.log('作为纯文本处理');
  return `<div class="whitespace-pre-wrap">${processedContent}</div>`;
}

/**
 * 为markdown内容添加样式类
 * @param html - HTML字符串
 * @returns 添加了样式类的HTML字符串
 */
export function addMarkdownStyles(html: string): string {
  if (!html) {
    return "";
  }

  return (
    html
      // 为标题添加样式，特别优化中文标题
      .replace(
        /<h1>/g,
        '<h1 class="text-2xl font-bold text-amber-900 mb-4 mt-6 first:mt-0 tracking-wide">',
      )
      .replace(
        /<h2>/g,
        '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-2 tracking-wide">',
      )
      .replace(
        /<h3>/g,
        '<h3 class="text-lg font-semibold text-amber-800 mb-2 mt-4 first:mt-0 tracking-wide">',
      )
      .replace(
        /<h4>/g,
        '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0 tracking-wide">',
      )
      // 为段落添加样式，优化中文阅读体验
      .replace(/<p>/g, '<p class="mb-3 text-gray-700 leading-relaxed text-sm">')
      // 为列表添加样式，优化中文列表显示
      .replace(/<ul>/g, '<ul class="mb-4 ml-6 space-y-2 list-disc">')
      .replace(/<ol>/g, '<ol class="mb-4 ml-6 space-y-2 list-decimal">')
      .replace(/<li>/g, '<li class="text-gray-700 text-sm leading-relaxed pl-1">')
      // 为强调文本添加样式
      .replace(/<strong>/g, '<strong class="font-semibold text-amber-800">')
      .replace(/<em>/g, '<em class="italic text-amber-700">')
      // 为代码添加样式
      .replace(
        /<code>/g,
        '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">',
      )
      .replace(
        /<pre>/g,
        '<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">',
      )
      // 为引用添加样式
      .replace(
        /<blockquote>/g,
        '<blockquote class="border-l-4 border-amber-300 pl-4 italic text-amber-700 mb-3">',
      )
      // 为分隔线添加样式
      .replace(
        /<hr>/g,
        '<hr class="my-6 border-t border-amber-300">',
      )
  );
}

/**
 * 从 Markdown 文本中按标题截取指定章节
 * - 默认包含起始标题行，直到遇到下一个同级标题（例如下一个以 `##` 开头的二级标题）
 * - 若未命中则返回空字符串
 */
export function extractSectionByHeading(
  markdown: string,
  opts?: { start?: RegExp | string; stop?: RegExp | string; includeHeading?: boolean }
): string {
  if (!markdown || typeof markdown !== 'string') return '';

  const startPattern = opts?.start ?? /^##\s*【命主信息概览】\s*$/m;
  const stopPattern = opts?.stop ?? /^##\s+/m;
  const includeHeading = opts?.includeHeading ?? true;

  const startRegex = startPattern instanceof RegExp ? startPattern : new RegExp(startPattern, 'm');
  const stopRegex = stopPattern instanceof RegExp ? stopPattern : new RegExp(stopPattern, 'm');

  const startMatch = markdown.match(startRegex);
  if (!startMatch) return '';

  // 计算起始位置（是否包含标题本行）
  const startIndex = includeHeading
    ? startMatch.index ?? 0
    : (startMatch.index ?? 0) + startMatch[0].length;

  // 从起点开始向后查找下一个同级标题
  const rest = markdown.slice(startIndex);
  const stopMatch = rest.match(stopRegex);
  if (!stopMatch) {
    return rest.trim();
  }

  const endIndex = stopMatch.index ?? 0;
  return rest.slice(0, endIndex).trim();
}

/**
 * 清理扣子返回中的噪声（如 RPCError、内部日志等），返回更干净的文本
 */
export function cleanCozeNoise(original: string): string {
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
 * 更鲁棒地从混杂文本中提取"【命主信息概览】"片段
 * - 先清理噪声
 * - 优先匹配带 Markdown 标题的写法：^##\s*【命主信息概览】
 * - 其次匹配不带 ## 的纯中文标题：^\s*【命主信息概览】
 * - 若仍未命中，尝试用关键字段（性别/出生时间/四柱/手型）构造一个最小概览
 */
export function extractOverviewSection(raw: string): string {
  if (!raw) return '';
  const text = cleanCozeNoise(raw);

  // 1) 带 Markdown 标题
  const md = extractSectionByHeading(text, {
    start: /^##\s*【命主信息概览】\s*$/m,
    stop: /^##\s+/m,
    includeHeading: true,
  });
  if (md) return md;

  // 2) 纯中文标题（无 ##），向后截取到下一个可能的章节分隔
  const plainTitle = text.search(/^\s*【命主信息概览】\s*$/m);
  if (plainTitle !== -1) {
    const after = text.slice(plainTitle);
    // 更精确的停止条件：遇到分隔符、下一个主要章节或分析报告标题
    const stopMatch = after.match(/^---\s*$|^---\s*##\s+|^##\s+一、|^##\s+核心命理分析报告|^###\s+二、|^###\s+天赋挖掘与成长建议/m);
    const body = stopMatch ? after.slice(0, stopMatch.index ?? 0) : after;
    
    // 如果找到了停止点，只取到分隔符之前的内容
    if (stopMatch && stopMatch[0].includes('---')) {
      const beforeSeparator = body.split('---')[0];
      const result = beforeSeparator.trim().startsWith('##') ? beforeSeparator.trim() : `## 【命主信息概览】\n${beforeSeparator.trim()}`;
      console.log('提取的概览内容（分隔符前）:', result);
      return result;
    }
    
    return body.trim().startsWith('##') ? body.trim() : `## 【命主信息概览】\n${body.trim()}`;
  }

  // 3) 关键字段兜底提取（粗提取几项常见行）
  const lines = text.split(/\r?\n/);
  const picked: string[] = [];
  const keyLine = (re: RegExp) => lines.find((l) => re.test(l)) || '';
  const l1 = keyLine(/\*\s*\*\*性别\*\*\s*：/);
  const l2 = keyLine(/\*\s*\*\*出生时间\*\*\s*：/);
  const l3 = keyLine(/\*\s*\*\*四柱八字\*\*\s*：/);
  const l4 = keyLine(/\*\s*\*\*紫微主星\*\*\s*：/);
  const l5 = keyLine(/\*\s*\*\*手型\*\*\s*：/);
  [l1, l2, l3, l4, l5].forEach((l) => l && picked.push(l.trim()))
  if (picked.length) {
    return ['## 【命主信息概览】', ...picked, '', '---'].join('\n');
  }

  return '';
}

/**
 * 从一段 HTML 中移除“【命主信息概览】”对应的章节块（通常为一个 <h2> 开头到下一个 <h2>/<h1>/<hr> 之间）
 * 适配：
 * - <h2>【命主信息概览】</h2>
 * - <h1>【命主信息概览】</h1>
 * - 纯文本 "【命主信息概览】" 后紧随段落
 */
export function stripOverviewFromHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  const content = html;

  // 1) 查找 <h2> 或 <h1> 中包含 "【命主信息概览】"
  const headingRegex = /<(h[12])[^>]*>\s*[^<【]*【命主信息概览】[^<]*<\/\1>/i;
  const match = content.match(headingRegex);
  if (match && match.index !== undefined) {
    const start = match.index;
    // 从标题结束位置向后寻找下一个节标题或水平线作为终点
    const after = content.slice(start + match[0].length);
    const stop = after.search(/<h1|<h2|<hr\b/i);
    const end = stop !== -1 ? start + match[0].length + stop : content.length;
    return (content.slice(0, start) + content.slice(end)).trim();
  }

  // 2) 兜底：纯文本“【命主信息概览】”
  const plainIdx = content.indexOf('【命主信息概览】');
  if (plainIdx !== -1) {
    const after = content.slice(plainIdx);
    const stop = after.search(/<h1|<h2|<hr\b/i);
    const end = stop !== -1 ? plainIdx + stop : content.length;
    return (content.slice(0, plainIdx) + content.slice(end)).trim();
  }

  return content;
}