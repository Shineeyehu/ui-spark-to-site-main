import { marked } from "marked";

/**
 * 配置marked选项
 */
marked.setOptions({
  breaks: true, // 支持换行符
  gfm: true, // 支持GitHub风格的markdown
  smartLists: true, // 智能列表
  smartypants: true, // 智能标点
});

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
    return marked.parse(markdown);
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

  // 如果检测到markdown格式，进行转换并添加样式
  if (isMarkdownFormat(processedContent)) {
    console.log('检测到Markdown格式，进行转换');
    const html = markdownToHtml(processedContent);
    return addMarkdownStyles(html);
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