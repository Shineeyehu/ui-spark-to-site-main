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
 * 智能内容处理：自动检测格式并转换（展示所有content数据，不过滤）
 * @param content - 内容文本
 * @returns 处理后的HTML字符串
 */
export function smartContentProcess(content: string): string {
  if (!content) {
    return "";
  }

  console.log('smartContentProcess 接收到的原始内容:', content);

  // 如果内容已经是HTML格式（包含HTML标签），直接返回
  if (content.includes("<") && content.includes(">")) {
    console.log('检测到HTML格式，直接返回');
    return content;
  }

  // 预处理内容，处理JSON格式的扣子返回数据
  let processedContent = content;
  
  // 尝试解析JSON格式的扣子返回数据
  try {
    // 检查是否为JSON格式
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      const jsonData = JSON.parse(content);
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
      return addMarkdownStyles(html);
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
 * 更鲁棒地从混杂文本中提取“【命主信息概览】”片段
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
    const stopMatch = after.match(/^##\s+|^###\s+|^---\s*$/m);
    const body = stopMatch ? after.slice(0, stopMatch.index ?? 0) : after;
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