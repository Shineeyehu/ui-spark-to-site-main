/**
 * 内容过滤工具
 * 用于从扣子返回的数据中提取最终分析结果，过滤掉处理状态信息
 */

/**
 * 从扣子返回的内容中提取最终分析结果
 * @param content 原始内容
 * @returns 过滤后的最终分析结果
 */
export function extractFinalAnalysis(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // 移除常见的处理状态信息和API数据
  const statusPatterns = [
    /正在分析.*?请稍候/gi,
    /正在处理.*?请等待/gi,
    /分析中.*?/gi,
    /处理中.*?/gi,
    /正在调用.*?进行.*?分析/gi,
    /正在生成.*?/gi,
    /请稍等.*?/gi,
    /loading.*?/gi,
    /^分析进度.*?$/gmi,
    /^处理进度.*?$/gmi,
    /^状态.*?$/gmi,
    // 移除API相关的技术信息
    /\\"type\\":\\"[^"]*\\"/gi,
    /\\"plugin\\"/gi,
    /\\"apiId\\":\\"[^"]*\\"/gi,
    /进行排盘时，要用户填写的出生时间，根据下面的对应关系/gi,
    /\\"time_index\\".*?参数/gi,
    /\\\\n.*?例如，用户填写的是/gi,
    /对应的是.*?区间/gi,
    /那么.*?参数是/gi,
    /将填入time_index参数/gi,
    /\\\\n----\\\\n.*?早子时/gi,
    /填入参数是.*?\\\\n/gi,
    // 移除JSON格式的技术数据
    /\{[^}]*"type"[^}]*\}/gi,
    /\{[^}]*"plugin"[^}]*\}/gi,
    /\{[^}]*"apiId"[^}]*\}/gi,
  ];

  let filteredContent = content;

  // 移除状态信息
  statusPatterns.forEach(pattern => {
    filteredContent = filteredContent.replace(pattern, '');
  });

  // 查找最终分析结果的标志性开头
  const analysisMarkers = [
    /## 【命主信息概览】/,
    /## 一、 核心命理分析报告/,
    /## 个人性格分析/,
    /## 命理分析报告/,
    /### 核心特质/,
    /\*\*性别\*\*/,
    /\*\*出生时间\*\*/
  ];

  // 尝试找到分析结果的开始位置
  let startIndex = -1;
  for (const marker of analysisMarkers) {
    const match = filteredContent.match(marker);
    if (match && match.index !== undefined) {
      startIndex = match.index;
      break;
    }
  }

  // 如果找到了分析结果的开始位置，从该位置开始提取
  if (startIndex >= 0) {
    filteredContent = filteredContent.substring(startIndex);
  }

  // 移除重复的内容（有时扣子会返回重复的分析结果）
  const lines = filteredContent.split('\n');
  const uniqueLines: string[] = [];
  const seenLines = new Set<string>();

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !seenLines.has(trimmedLine)) {
      seenLines.add(trimmedLine);
      uniqueLines.push(line);
    } else if (!trimmedLine) {
      // 保留空行用于格式化
      uniqueLines.push(line);
    }
  }

  // 重新组合内容
  filteredContent = uniqueLines.join('\n');

  // 清理多余的空行
  filteredContent = filteredContent
    .replace(/\n{3,}/g, '\n\n') // 将3个或更多连续换行替换为2个
    .trim(); // 移除首尾空白

  return filteredContent;
}

/**
 * 检查内容是否包含最终分析结果
 * @param content 要检查的内容
 * @returns 是否包含最终分析结果
 */
export function containsFinalAnalysis(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const analysisIndicators = [
    '【命主信息概览】',
    '核心命理分析报告',
    '性格特质与教养指南',
    '潜在天赋深掘',
    '成长关键节点',
    '天赋挖掘与成长建议',
    '玄机子大师结语',
    '四柱八字',
    '紫微主星'
  ];

  return analysisIndicators.some(indicator => 
    content.includes(indicator)
  );
}

/**
 * 从内容中提取关键信息摘要
 * @param content 原始内容
 * @returns 关键信息摘要
 */
export function extractKeySummary(content: string): {
  gender?: string;
  birthTime?: string;
  eightCharacters?: string;
  purpleStars?: string;
  handType?: string;
} {
  if (!content) return {};

  const summary: any = {};

  // 提取性别
  const genderMatch = content.match(/\*\*性别\*\*[：:]\s*([男女])/);
  if (genderMatch) {
    summary.gender = genderMatch[1];
  }

  // 提取出生时间
  const birthTimeMatch = content.match(/\*\*出生时间\*\*[：:]\s*([^*\n]+)/);
  if (birthTimeMatch) {
    summary.birthTime = birthTimeMatch[1].trim();
  }

  // 提取四柱八字
  const eightCharMatch = content.match(/\*\*四柱八字\*\*[：:]\s*([^*\n]+)/);
  if (eightCharMatch) {
    summary.eightCharacters = eightCharMatch[1].trim();
  }

  // 提取紫微主星
  const purpleStarMatch = content.match(/\*\*紫微主星\*\*[：:]\s*([^*\n]+)/);
  if (purpleStarMatch) {
    summary.purpleStars = purpleStarMatch[1].trim();
  }

  // 提取手型
  const handTypeMatch = content.match(/\*\*手型\*\*[：:]\s*([^*\n]+)/);
  if (handTypeMatch) {
    summary.handType = handTypeMatch[1].trim();
  }

  return summary;
}