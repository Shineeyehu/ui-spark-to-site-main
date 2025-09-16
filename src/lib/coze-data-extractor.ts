/**
 * 扣子数据提取工具
 * 用于从扣子API返回的原始数据中提取有效的命理分析内容
 */

export interface ExtractedCozeData {
  // 基本信息
  name?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  
  // 八字信息
  fourPillars?: string;
  
  // 紫微斗数
  ziWeiMainStar?: string;
  bodyPalace?: string;
  
  // 性格分析
  personalityTraits?: string;
  coreCharacteristics?: string;
  
  // 天赋分析
  talents?: string;
  strengths?: string;
  
  // 学业方向
  academicDirection?: string;
  subjectPreferences?: string;
  
  // 兴趣培养
  interestRecommendations?: string;
  hobbyList?: string;
  
  // 职业发展
  careerDirection?: string;
  industryRecommendations?: string;
  
  // 运势分析
  currentFortune?: string;
  futureOutlook?: string;
  luckyElements?: string;
  
  // 成长建议
  growthAdvice?: string;
  developmentSuggestions?: string;
  
  // 2025年运势
  year2025Forecast?: string;
  importantEvents?: string;
  
  // 原始内容（备用）
  rawContent?: string;
}

export class CozeDataExtractor {
  /**
   * 从扣子API返回的原始数据中提取有效内容
   */
  static extractFromRawData(rawData: string): ExtractedCozeData {
    try {
      console.log('开始提取扣子数据，原始数据长度:', rawData.length);
      
      // 1. 尝试多种方式提取有效内容
      let cleanContent = this.extractValidContent(rawData);
      
      // 2. 如果没有找到有效内容，尝试直接解析
      if (!cleanContent || cleanContent.length < 100) {
        console.warn('未找到有效的数据标记，尝试直接解析');
        cleanContent = this.cleanRawData(rawData);
      }
      
      console.log('提取的有效内容长度:', cleanContent.length);
      console.log('有效内容预览:', cleanContent.substring(0, 200));
      
      // 3. 解析内容
      const result = this.parseContent(cleanContent);
      
      // 4. 如果解析结果为空，尝试从原始数据中提取
      if (!result.personalityTraits && !result.coreCharacteristics) {
        console.log('解析结果为空，尝试从原始数据提取');
        return this.parseContent(rawData);
      }
      
      return result;
      
    } catch (error) {
      console.error('数据提取失败:', error);
      return {
        rawContent: rawData,
        personalityTraits: '数据解析失败，请检查原始数据格式'
      };
    }
  }

  /**
   * 提取有效内容的多种策略
   */
  private static extractValidContent(rawData: string): string {
    // 策略1: 查找流式数据中的内容
    const contentPattern = /"content":"([^"]+)"/g;
    let matches = [];
    let match;
    
    while ((match = contentPattern.exec(rawData)) !== null) {
      const content = match[1];
      // 过滤掉系统消息和工作流信息
      if (!content.includes('workflow') && 
          !content.includes('uuid') && 
          !content.includes('shouxiang') &&
          content.length > 20) {
        matches.push(content);
      }
    }
    
    if (matches.length > 0) {
      return matches.join('\n');
    }
    
    // 策略2: 查找完整的分析报告
    const reportPattern = /##\s*[个人性格分析|命理分析|八字分析]/i;
    const reportMatch = rawData.match(reportPattern);
    if (reportMatch) {
      const startIndex = reportMatch.index || 0;
      return rawData.substring(startIndex);
    }
    
    // 策略3: 查找Markdown格式的内容
    const markdownPattern = /#+\s*[^#\n]+/;
    const markdownMatch = rawData.match(markdownPattern);
    if (markdownMatch) {
      const startIndex = markdownMatch.index || 0;
      return rawData.substring(startIndex);
    }
    
    return '';
  }

  /**
   * 从JSON格式中提取命主信息
   */
  private static extractFromJsonFormat(content: string, result: ExtractedCozeData): void {
    try {
      // 查找JSON对象中的命主信息
      const jsonPattern = /\{[^{}]*"[^"]*"[^{}]*\}/g;
      const jsonMatches = content.match(jsonPattern);
      
      if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
          try {
            const jsonData = JSON.parse(jsonStr);
            
            // 提取各种可能的字段
            if (jsonData.name && !result.name) {
              result.name = jsonData.name;
            }
            if (jsonData.gender && !result.gender) {
              result.gender = jsonData.gender === 'male' ? '男' : jsonData.gender === 'female' ? '女' : jsonData.gender;
            }
            if (jsonData.bazi && !result.fourPillars) {
              result.fourPillars = jsonData.bazi;
            }
            if (jsonData.linyidengtuibazi && !result.fourPillars) {
              result.fourPillars = jsonData.linyidengtuibazi;
            }
            
            // 处理日期时间信息
            if (jsonData.day_DZ_ss && jsonData.hour_DZ_ss && jsonData.year_TG_ss && jsonData.month_DZ_ss) {
              if (!result.fourPillars) {
                result.fourPillars = `${jsonData.year_TG_ss}${jsonData.year_DZ_ss} ${jsonData.month_TG_ss}${jsonData.month_DZ_ss} ${jsonData.day_TG_ss}${jsonData.day_DZ_ss} ${jsonData.hour_TG_ss}${jsonData.hour_DZ_ss}`;
              }
            }
            
            console.log('📊 从JSON中提取到的信息:', {
              name: result.name,
              gender: result.gender,
              fourPillars: result.fourPillars
            });
            
          } catch (e) {
            // 忽略JSON解析错误，继续处理下一个
            continue;
          }
        }
      }
      
      // 查找特定的命主信息模式
      const namePattern = /"name"\s*:\s*"([^"]+)"/i;
      const nameMatch = content.match(namePattern);
      if (nameMatch && !result.name) {
        result.name = nameMatch[1];
      }
      
      const genderPattern = /"gender"\s*:\s*"([^"]+)"/i;
      const genderMatch = content.match(genderPattern);
      if (genderMatch && !result.gender) {
        const gender = genderMatch[1];
        result.gender = gender === 'male' ? '男' : gender === 'female' ? '女' : gender;
      }
      
    } catch (error) {
      console.warn('JSON格式解析失败:', error);
    }
  }

  /**
   * 清理原始数据，移除系统信息
   */
  private static cleanRawData(rawData: string): string {
    return rawData
      // 移除JSON结构
      .replace(/\{"[^"]*":[^}]*\}/g, '')
      // 移除工作流信息
      .replace(/workflow[^,\n]*/gi, '')
      .replace(/uuid[^,\n]*/gi, '')
      .replace(/shouxiang[^,\n]*/gi, '')
      // 移除特殊字符
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\"/g, '"')
      .replace(/\\'/g, "'")
      // 清理多余空白
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * 解析内容，提取各个字段
   */
  private static parseContent(content: string): ExtractedCozeData {
    const result: ExtractedCozeData = {
      rawContent: content
    };
    
    // 清理内容
    const cleanContent = this.cleanContent(content);
    
    console.log('🔍 开始解析扣子数据...');
    console.log('📝 清理后的内容长度:', cleanContent.length);
    console.log('📝 内容预览:', cleanContent.substring(0, 300) + '...');
    
    // 首先尝试从JSON格式中提取命主信息
    this.extractFromJsonFormat(cleanContent, result);
    
    // 提取基本信息 - 支持markdown格式和多种模式，包括【命主信息概览】格式
    result.name = this.extractPattern(cleanContent, /\*\*姓名\*\*[：:]\s*([^\n\r*，,。.]+)/i) || 
                  this.extractPattern(cleanContent, /\*\*命主\*\*[：:]\s*([^\n\r*，,。.]+)/i) ||
                  this.extractPattern(cleanContent, /姓名[：:]\s*([^\n\r，,。.]+)/i) || 
                  this.extractPattern(cleanContent, /命主[：:]\s*([^\n\r，,。.]+)/i) ||
                  this.extractPattern(cleanContent, /姓名\s+([^\n\r，,。.]+)/i) ||
                  this.extractPattern(cleanContent, /命主\s+([^\n\r，,。.]+)/i) ||
                  // 新增：支持【命主信息概览】格式
                  this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?姓名[：:]\s*([^\n\r，,。.]+)/i) ||
                  this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?命主[：:]\s*([^\n\r，,。.]+)/i);
    
    result.gender = this.extractPattern(cleanContent, /\*\*性别\*\*[：:]\s*([男女])/i) ||
                    this.extractPattern(cleanContent, /性别[：:]\s*([男女])/i) ||
                    this.extractPattern(cleanContent, /性别\s*[：:]?\s*([男女])/i) ||
                    this.extractPattern(cleanContent, /^性别[：:：]?\s*([男女])/im) ||
                    // 新增：支持【命主信息概览】格式
                    this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?性别[：:]\s*([男女])/i);
    
    result.birthDate = this.extractPattern(cleanContent, /\*\*出生[日期时间]*\*\*[：:]\s*[^0-9]*(\d{4}年\d{1,2}月\d{1,2}日)/i) ||
                       this.extractPattern(cleanContent, /出生[日期时间]*[：:]\s*[^0-9]*(\d{4}年\d{1,2}月\d{1,2}日)/i) ||
                       this.extractPattern(cleanContent, /出生时间[：:]\s*(\d{4}-\d{1,2}-\d{1,2})/i) ||
                       this.extractPattern(cleanContent, /(\d{4}-\d{1,2}-\d{1,2})/) ||
                       this.extractPattern(cleanContent, /生日[：:]\s*([^\n\r，,。.]+)/i) ||
                       this.extractPattern(cleanContent, /出生\s+(\d{4}年\d{1,2}月\d{1,2}日)/i) ||
                       // 新增：支持【命主信息概览】格式和公历格式
                       this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?出生时间[：:]\s*[^0-9]*(\d{4}年\d{1,2}月\d{1,2}日)/i) ||
                       this.extractPattern(cleanContent, /公历\s*(\d{4}年\d{1,2}月\d{1,2}日)/i) ||
                       this.extractPattern(cleanContent, /农历\s*(\d{4}年\d{1,2}月\d{1,2}日)/i);
    
    result.birthTime = this.extractPattern(cleanContent, /\*\*出生时间\*\*[：:]\s*[^0-9]*(\d{1,2}时)/i) ||
                       this.extractPattern(cleanContent, /出生时间[：:]\s*[^0-9]*(\d{1,2}时)/i) ||
                       this.extractPattern(cleanContent, /出生时间[：:]\s*(\d{4}-\d{1,2}-\d{1,2})\s+(\d{4})/i) ||
                       this.extractPattern(cleanContent, /(\d{1,2}[：:]?\d{2}[时分]?)/i) ||
                       this.extractPattern(cleanContent, /时辰[：:]\s*([^\n\r，,。.]+)/i) ||
                       // 新增：支持【命主信息概览】格式和时辰格式
                       this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?(\d{1,2}时)/i) ||
                       this.extractPattern(cleanContent, /(\d{1,2}时\d{1,2}分)/i);
    
    console.log('👤 基本信息提取结果:', {
      name: result.name,
      gender: result.gender,
      birthDate: result.birthDate,
      birthTime: result.birthTime
    });
    
    // 提取八字信息 - 支持多种格式，包括【命主信息概览】格式
    result.fourPillars = this.extractPattern(cleanContent, /[四八]柱[八字]*[：:]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]\s*[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]\s*[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]\s*[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/i) ||
                         this.extractPattern(cleanContent, /四柱八字[：:]\s*([^\n\r]+)/i) ||
                         this.extractPattern(cleanContent, /^四柱八字[：:：]?\s*([^\n\r]+)/im) ||
                         // 新增：支持【命主信息概览】格式
                         this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?四柱八字[：:]\s*([^\n\r]+)/i) ||
                         this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?八字[：:]\s*([^\n\r]+)/i);
    
    // 提取紫微斗数信息 - 支持多种格式，包括【命主信息概览】格式
    result.ziWeiMainStar = this.extractPattern(cleanContent, /命宫[：:]\s*\[([^\]]+)\]/i) ||
                           this.extractPattern(cleanContent, /紫微主星[：:]\s*([^\n\r，,。.]+)/i) ||
                           this.extractPattern(cleanContent, /紫微主星[：:]\s*([^\n\r]+)/i) ||
                           this.extractPattern(cleanContent, /^紫微主星[：:：]?\s*([^\n\r]+)/im) ||
                           // 新增：支持【命主信息概览】格式
                           this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?紫微主星[：:]\s*([^\n\r]+)/i) ||
                           this.extractPattern(cleanContent, /【命主信息概览】[\s\S]*?主星[：:]\s*([^\n\r]+)/i);
    
    result.bodyPalace = this.extractPattern(cleanContent, /身宫[：:]\s*\[([^\]]+)\]/i);
    
    // 提取性格特质 - 使用更灵活的匹配
    result.personalityTraits = this.extractSection(cleanContent, [
      '个人性格分析', '性格特质', '核心特质', '性格分析', '个性特征'
    ]) || this.extractSection(cleanContent, [
      '理性思维', '创新精神', '独立自主', '内敛深沉'
    ]);
    
    result.coreCharacteristics = this.extractSection(cleanContent, [
      '核心特征', '主要特点', '性格特点', '个性特点'
    ]);
    
    console.log('🎭 性格特质提取结果:', {
      personalityTraits: result.personalityTraits,
      coreCharacteristics: result.coreCharacteristics
    });
    
    // 提取才能和优势
    result.talents = this.extractSection(cleanContent, [
      '天赋才能', '特长', '才华', '天赋'
    ]);
    
    result.strengths = this.extractSection(cleanContent, [
      '优势', '长处', '强项', '擅长'
    ]);
    
    console.log('💎 才能优势提取结果:', {
      talents: result.talents,
      strengths: result.strengths
    });
    
    // 提取学业方向
    result.academicDirection = this.extractSection(cleanContent, [
      '学业方向', '学习建议', '教育建议', '学术发展'
    ]);
    
    result.subjectPreferences = this.extractSection(cleanContent, [
      '学科偏好', '专业选择', '课程推荐'
    ]);
    
    // 提取兴趣爱好
    result.interestRecommendations = this.extractSection(cleanContent, [
      '兴趣推荐', '爱好建议', '兴趣爱好'
    ]);
    
    result.hobbyList = this.extractSection(cleanContent, [
      '爱好清单', '兴趣列表', '推荐活动'
    ]);
    
    // 提取职业方向
    result.careerDirection = this.extractSection(cleanContent, [
      '职业方向', '职业倾向', '事业发展', '工作建议', '职业建议'
    ]);
    
    result.industryRecommendations = this.extractSection(cleanContent, [
      '行业推荐', '适合行业', '职业选择'
    ]);
    
    // 提取运势信息
    result.currentFortune = this.extractSection(cleanContent, [
      '当前运势', '近期运势', '现状分析'
    ]);
    
    result.futureOutlook = this.extractSection(cleanContent, [
      '未来展望', '发展前景', '未来趋势'
    ]);
    
    result.luckyElements = this.extractSection(cleanContent, [
      '幸运元素', '吉祥物', '幸运色彩', '幸运数字'
    ]);
    
    // 提取发展建议
    result.growthAdvice = this.extractSection(cleanContent, [
      '成长建议', '发展建议', '人生建议', '成长指导'
    ]);
    
    result.developmentSuggestions = this.extractSection(cleanContent, [
      '发展建议', '提升建议', '改进建议'
    ]);
    
    // 提取2025年预测
    result.year2025Forecast = this.extractSection(cleanContent, [
      '2025年', '明年', '来年预测'
    ]);
    
    result.importantEvents = this.extractSection(cleanContent, [
      '重要事件', '关键时期', '重要节点'
    ]);
    
    // 提取性格特质
    result.personalityTraits = this.extractSection(cleanContent, ['性格特质', '个性分析', '性格分析']);
    result.coreCharacteristics = this.extractSection(cleanContent, ['核心特质', '主要特征']);
    
    // 提取天赋分析
    result.talents = this.extractSection(cleanContent, ['天赋', '潜能', '才能']);
    result.strengths = this.extractSection(cleanContent, ['优势', '长处', '特长']);
    
    // 提取学业方向
    result.academicDirection = this.extractSection(cleanContent, ['学业方向', '学科适合', '专业建议', '适合专业', '学习方向', '教育建议']);
    result.subjectPreferences = this.extractSection(cleanContent, ['学科偏好', '科目倾向', '课程偏好', '学科选择', '专业选择', '学习偏好']);
    
    // 提取兴趣培养
    result.interestRecommendations = this.extractSection(cleanContent, ['兴趣培养', '爱好建议', '兴趣推荐', '兴趣发展', '爱好培养', '兴趣指导']);
    result.hobbyList = this.extractSection(cleanContent, ['兴趣清单', '爱好列表', '兴趣爱好', '推荐活动', '课外活动']);
    
    // 提取职业发展
    result.careerDirection = this.extractSection(cleanContent, ['职业方向', '事业发展', '职业建议', '职业规划', '事业规划', '工作方向']);
    result.industryRecommendations = this.extractSection(cleanContent, ['行业推荐', '适合行业', '行业建议', '职业选择', '行业选择', '工作领域']);
    
    // 提取运势分析
    result.currentFortune = this.extractSection(cleanContent, ['当前运势', '现阶段运势']);
    result.futureOutlook = this.extractSection(cleanContent, ['未来展望', '运势展望']);
    result.luckyElements = this.extractSection(cleanContent, ['幸运元素', '吉祥物', '开运']);
    
    // 提取成长建议
    result.growthAdvice = this.extractSection(cleanContent, ['成长建议', '发展建议', '教育建议']);
    result.developmentSuggestions = this.extractSection(cleanContent, ['发展方向', '培养建议']);
    
    // 提取2025年运势
    result.year2025Forecast = this.extractSection(cleanContent, ['2025年', '明年运势', '来年展望']);
    result.importantEvents = this.extractPattern(cleanContent, /2025年.*?重要.*?([^。.！!？?]+)/i);
    
    // 数据完整性检查
    const completeness = this.getDataCompleteness(result);
    const isValid = this.validateExtractedData(result);
    
    console.log('📊 数据提取完成，完整性分析:', {
      completeness: `${completeness}%`,
      isValid,
      extractedFields: Object.keys(result).filter(key => result[key as keyof ExtractedCozeData] && key !== 'rawContent'),
      totalFields: Object.keys(result).length - 1 // 排除rawContent
    });
    
    return result;
  }
  
  /**
   * 清理内容，移除多余的格式字符
   */
  private static cleanContent(content: string): string {
    return content
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * 使用正则表达式提取特定模式的内容
   */
  private static extractPattern(content: string, pattern: RegExp): string | undefined {
    const match = content.match(pattern);
    return match ? match[1]?.trim() : undefined;
  }

  /**
   * 智能提取内容 - 尝试多种格式
   */
  private static smartExtract(content: string, keywords: string[]): string | undefined {
    for (const keyword of keywords) {
      // 转义关键词中的特殊正则表达式字符
      const escapedKeyword = this.escapeRegExp(keyword);
      
      // 尝试多种格式
      const patterns = [
        // 标准格式：关键词：内容
        new RegExp(`${escapedKeyword}[：:：]\\s*([^\\n\\r]+)`, 'i'),
        // 空格分隔：关键词 内容
        new RegExp(`${escapedKeyword}\\s+([^\\n\\r]+)`, 'i'),
        // 段落格式：关键词后跟换行
        new RegExp(`${escapedKeyword}[：:：]?\\s*\\n([^\\n\\r]+)`, 'i'),
        // 句子中的格式
        new RegExp(`${escapedKeyword}.*?[是为]\\s*([^，,。.！!？?\\n\\r]+)`, 'i'),
        // 括号格式
        new RegExp(`${escapedKeyword}.*?[（(]([^）)]+)[）)]`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1] && match[1].trim()) {
          return match[1].trim();
        }
      }
    }
    return undefined;
  }
  
  /**
   * 提取特定主题的段落内容
   */
  private static extractSection(content: string, keywords: string[]): string | undefined {
    for (const keyword of keywords) {
      console.log(`🔍 尝试提取关键词: ${keyword}`);
      
      // 转义关键词中的特殊正则表达式字符
      const escapedKeyword = this.escapeRegExp(keyword);
      
      // 尝试匹配标题后的内容 - 增加更多模式
      const patterns = [
        // Markdown粗体格式
        new RegExp(`\\*\\*${escapedKeyword}\\*\\*[：:：]\\s*([^\\n\\r*]+)`, 'i'),
        // 标准冒号格式
        new RegExp(`${escapedKeyword}[：:：]\\s*([^\\n\\r]*(?:\\n[^\\n\\r#]*)*?)(?=\\n\\s*[#\\d]|$)`, 'i'),
        // 带换行的段落格式
        new RegExp(`${escapedKeyword}[：:：]?\\s*\\n([^\\n\\r]*(?:\\n[^\\n\\r#]*)*?)(?=\\n\\s*[#\\d]|$)`, 'i'),
        // 句子格式
        new RegExp(`${escapedKeyword}.*?[：:：]([^。.！!？?]*[。.！!？?])`, 'i'),
        // 简单行格式
        new RegExp(`${escapedKeyword}[^：:：]*[：:：]([^\\n\\r]+)`, 'i'),
        // 无冒号直接跟随格式
        new RegExp(`${escapedKeyword}\\s+([^\\n\\r]+)`, 'i'),
        // Markdown标题格式
        new RegExp(`#+\\s*${escapedKeyword}[：:：]?\\s*\\n([^#]*?)(?=\\n#+|$)`, 'i'),
        // 列表格式
        new RegExp(`[\\*\\-]\\s*${escapedKeyword}[：:：]?\\s*([^\\n\\r]+)`, 'i'),
        // 段落中嵌入格式 - 查找包含关键词的句子
        new RegExp(`([^。.！!？?\\n]*${escapedKeyword}[^。.！!？?\\n]*[。.！!？?])`, 'i'),
        // 多行内容格式 - 查找关键词后的多行内容
        new RegExp(`${escapedKeyword}[：:：]?\\s*([\\s\\S]*?)(?=\\n\\s*(?:[\\*\\-]|\\d+\\.|[#]+|$))`, 'i')
      ];
      
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const match = content.match(pattern);
        if (match && match[1] && match[1].trim()) {
          let result = match[1].trim();
          
          // 清理结果 - 移除多余的符号和空白
          result = result.replace(/^\*+|\*+$/g, '').trim();
          result = result.replace(/^[：:：\s]+|[：:：\s]+$/g, '').trim();
          
          if (result.length > 10) { // 确保提取的内容有意义
            console.log(`✅ 成功提取 ${keyword} (模式${i+1}):`, result.substring(0, 100) + '...');
            return result;
          }
        }
      }
      
      console.log(`❌ 未能提取到 ${keyword}`);
    }
    return undefined;
  }
  
  /**
   * 验证提取的数据是否有效
   */
  static validateExtractedData(data: ExtractedCozeData): boolean {
    // 至少需要有一些基本信息
    return !!(
      data.name || 
      data.personalityTraits || 
      data.talents || 
      data.careerDirection ||
      data.rawContent
    );
  }
  
  /**
   * 获取数据完整性评分（0-100）
   */
  static getDataCompleteness(data: ExtractedCozeData): number {
    const fields = [
      'name', 'gender', 'birthDate', 'fourPillars', 'ziWeiMainStar',
      'personalityTraits', 'talents', 'academicDirection', 'interestRecommendations',
      'careerDirection', 'currentFortune', 'growthAdvice', 'year2025Forecast'
    ];
    
    const filledFields = fields.filter(field => data[field as keyof ExtractedCozeData]);
    return Math.round((filledFields.length / fields.length) * 100);
  }

  /**
   * 转义正则表达式中的特殊字符
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}