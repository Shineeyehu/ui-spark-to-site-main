import { marked } from "marked";

/**
 * 配置marked选项
 */
marked.setOptions({
  breaks: true, // 支持换行符
  gfm: true, // 支持GitHub风格的markdown
  sanitize: false, // 允许HTML标签
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
    return marked(markdown);
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

  // 检测常见的markdown标记
  const markdownPatterns = [
    /^#{1,6}\s/, // 标题
    /\*\*.*\*\*/, // 粗体
    /\*.*\*/, // 斜体
    /^\s*[-*+]\s/, // 无序列表
    /^\s*\d+\.\s/, // 有序列表
    /^\s*>\s/, // 引用
    /```/, // 代码块
    /`.*`/, // 行内代码
    /\[.*\]\(.*\)/, // 链接
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * 智能内容处理：自动检测格式并转换
 * @param content - 内容文本
 * @returns 处理后的HTML字符串
 */
export function smartContentProcess(content: string): string {
  if (!content) {
    return "";
  }

  // 如果内容已经是HTML格式（包含HTML标签），直接返回
  if (content.includes("<") && content.includes(">")) {
    return content;
  }

  // 如果检测到markdown格式，进行转换
  if (isMarkdownFormat(content)) {
    return markdownToHtml(content);
  }

  // 否则作为纯文本处理，保留换行
  return `<div class="whitespace-pre-wrap">${content}</div>`;
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
      // 为标题添加样式
      .replace(
        /<h1>/g,
        '<h1 class="text-2xl font-bold text-amber-900 mb-4 mt-6 first:mt-0">',
      )
      .replace(
        /<h2>/g,
        '<h2 class="text-xl font-bold text-amber-900 mb-3 mt-5 first:mt-0 border-b border-amber-300 pb-1">',
      )
      .replace(
        /<h3>/g,
        '<h3 class="text-lg font-semibold text-amber-800 mb-2 mt-4 first:mt-0">',
      )
      .replace(
        /<h4>/g,
        '<h4 class="text-base font-semibold text-amber-800 mb-2 mt-3 first:mt-0">',
      )
      // 为段落添加样式
      .replace(/<p>/g, '<p class="mb-3 text-gray-700 leading-relaxed">')
      // 为列表添加样式
      .replace(/<ul>/g, '<ul class="mb-3 ml-4 space-y-1">')
      .replace(/<ol>/g, '<ol class="mb-3 ml-4 space-y-1">')
      .replace(/<li>/g, '<li class="text-gray-700">')
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
  );
}
