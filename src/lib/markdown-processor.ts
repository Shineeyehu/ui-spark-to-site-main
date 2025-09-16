/**
 * Markdown处理器
 * 专门用于处理和优化从Coze返回的markdown内容
 */

export interface MarkdownSection {
  title: string;
  content: string;
  level: number;
  type: 'header' | 'content' | 'list' | 'table';
}

export interface ProcessedMarkdown {
  sections: MarkdownSection[];
  rawContent: string;
  cleanedContent: string;
  metadata: {
    hasHeaders: boolean;
    hasTables: boolean;
    hasLists: boolean;
    wordCount: number;
  };
}

export class MarkdownProcessor {
  /**
   * 处理markdown内容，提取结构化信息
   */
  processMarkdown(content: string): ProcessedMarkdown {
    const cleanedContent = this.cleanMarkdown(content);
    const sections = this.extractSections(cleanedContent);
    const metadata = this.analyzeContent(cleanedContent);

    return {
      sections,
      rawContent: content,
      cleanedContent,
      metadata
    };
  }

  /**
   * 清理markdown内容，移除多余的格式和字符
   */
  private cleanMarkdown(content: string): string {
    return content
      // 移除多余的空行
      .replace(/\n{3,}/g, '\n\n')
      // 修复标题格式
      .replace(/^#+\s*/gm, (match) => match.trim() + ' ')
      // 修复列表格式
      .replace(/^[-*+]\s*/gm, '- ')
      // 移除HTML标签（如果有）
      .replace(/<[^>]*>/g, '')
      // 修复粗体格式
      .replace(/\*\*([^*]+)\*\*/g, '**$1**')
      // 修复斜体格式
      .replace(/\*([^*]+)\*/g, '*$1*')
      // 移除多余的空格
      .replace(/[ \t]+/g, ' ')
      // 修复行尾空格
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  /**
   * 提取markdown的各个部分
   */
  private extractSections(content: string): MarkdownSection[] {
    const sections: MarkdownSection[] = [];
    const lines = content.split('\n');
    let currentSection: MarkdownSection | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检测标题 - 支持Markdown标题和中文方括号标题
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      const chineseTitleMatch = trimmedLine.match(/^【([^】]+)】$/);
      
      if (headerMatch) {
        // 保存之前的section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // 创建新的section
        currentSection = {
          title: headerMatch[2],
          content: '',
          level: headerMatch[1].length,
          type: 'header'
        };
      } else if (chineseTitleMatch) {
        // 处理中文方括号标题
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          title: chineseTitleMatch[1],
          content: '',
          level: 2, // 默认为二级标题
          type: 'header'
        };
      } else if (currentSection && trimmedLine) {
        // 添加内容到当前section
        if (currentSection.content) {
          currentSection.content += '\n';
        }
        currentSection.content += line;
        
        // 更新section类型
        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.startsWith('+')) {
          currentSection.type = 'list';
        } else if (trimmedLine.includes('|')) {
          currentSection.type = 'table';
        } else if (currentSection.type === 'header') {
          currentSection.type = 'content';
        }
      } else if (!currentSection && trimmedLine) {
        // 如果没有当前section但有内容，创建一个默认section
        currentSection = {
          title: '内容',
          content: line,
          level: 1,
          type: 'content'
        };
      }
    }

    // 添加最后一个section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * 分析markdown内容的元数据
   */
  private analyzeContent(content: string): ProcessedMarkdown['metadata'] {
    const hasHeaders = /^#{1,6}\s+/m.test(content);
    const hasTables = /\|.*\|/.test(content);
    const hasLists = /^[-*+]\s+/m.test(content);
    const wordCount = content.replace(/[^\u4e00-\u9fa5\w]/g, '').length;

    return {
      hasHeaders,
      hasTables,
      hasLists,
      wordCount
    };
  }

  /**
   * 将markdown转换为HTML（简单版本）
   */
  markdownToHtml(content: string): string {
    return content
      // 中文方括号标题
      .replace(/^【([^】]+)】$/gm, '<h2>【$1】</h2>')
      // 标题
      .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
        const level = hashes.length;
        return `<h${level}>${title}</h${level}>`;
      })
      // 粗体
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // 列表项
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // 段落（简单处理）
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      // 清理空段落
      .replace(/<p><\/p>/g, '')
      .replace(/<p>\s*<h/g, '<h')
      .replace(/h>\s*<\/p>/g, 'h>')
      // 包装列表
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // 段落
      .replace(/^(?!<[h|u|l])[^\n]+$/gm, '<p>$&</p>')
      // 换行
      .replace(/\n/g, '<br>');
  }

  /**
   * 提取特定类型的内容
   */
  extractContentByType(sections: MarkdownSection[], type: MarkdownSection['type']): MarkdownSection[] {
    return sections.filter(section => section.type === type);
  }

  /**
   * 根据标题级别提取内容
   */
  extractContentByLevel(sections: MarkdownSection[], level: number): MarkdownSection[] {
    return sections.filter(section => section.level === level);
  }

  /**
   * 搜索包含特定关键词的section
   */
  searchSections(sections: MarkdownSection[], keywords: string[]): MarkdownSection[] {
    return sections.filter(section => {
      const searchText = (section.title + ' ' + section.content).toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });
  }

  /**
   * 格式化为知识卡片所需的结构
   */
  formatForKnowledgeCard(processedMarkdown: ProcessedMarkdown): any {
    const { sections } = processedMarkdown;
    
    // 查找特定的命理分析部分
    const personalitySection = this.searchSections(sections, ['性格', '特质', '个性']);
    const talentSection = this.searchSections(sections, ['天赋', '才能', '潜力']);
    const fortuneSection = this.searchSections(sections, ['运势', '2025', '展望']);
    const conclusionSection = this.searchSections(sections, ['结语', '总结', '大师']);

    return {
      personalityAnalysis: personalitySection.map(s => s.content).join('\n'),
      talentAnalysis: talentSection.map(s => s.content).join('\n'),
      fortuneOutlook: fortuneSection.map(s => s.content).join('\n'),
      masterConclusion: conclusionSection.map(s => s.content).join('\n'),
      fullContent: processedMarkdown.cleanedContent
    };
  }
}

export const markdownProcessor = new MarkdownProcessor();