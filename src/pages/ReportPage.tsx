import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Star, TrendingUp, CheckCircle, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useMoonshot } from '@/hooks/use-moonshot';
import { useCozeStream } from '@/hooks/use-coze-stream';
import { smartContentProcess, addMarkdownStyles } from '@/lib/markdown-utils';
import { CozeMixedDataExtractor, type ExtractedCozeData } from '@/lib/coze-mixed-data-extractor';
import { KnowledgeCardMapper } from '@/lib/knowledge-card-mapper';
import type { BirthInfo } from '@/lib/coze-api';

const ReportPage = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAIImage, setShowAIImage] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalyzeHint, setShowAnalyzeHint] = useState(true);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  
  // 数据处理相关状态
  const [extractedData, setExtractedData] = useState<ExtractedCozeData | null>(null);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [isProcessingData, setIsProcessingData] = useState(false);
  
  const location = useLocation();
  
  // 初始化数据处理器
  const mixedDataExtractor = new CozeMixedDataExtractor();
  const knowledgeCardMapper = new KnowledgeCardMapper();
  
  // 使用Moonshot API Hook
  const {
    moonshotState,
    generateKnowledgeCard,
    generateKnowledgeCardStream,
    clearError: clearMoonshotError,
    clearContent: clearMoonshotContent
  } = useMoonshot({
    apiKey: 'sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e',
    model: 'kimi-k2-0905-preview',
    baseUrl: 'https://api.moonshot.cn/v1'
  });

  // 使用扣子API Hook
  const {
    isStreaming,
    messages,
    currentMessage,
    processedHTML,
    error: streamError,
    startBirthAnalysis,
    stopStream,
    clearMessages
  } = useCozeStream();

  // 从路由状态获取传递的数据
  const { generatedImageUrl, formData, analysisContent, fromBirthday, startAnalysis } = location.state || {};
  
  // 5秒后自动关闭分析提示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnalyzeHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 初始加载提示5秒后自动消失
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  
  /**
   * 四步数据处理流程
   * 1. 数据接收 → 从Coze API获取混合格式响应
   * 2. 内容分离 → 智能识别并分离JSON和Markdown部分
   * 3. Markdown处理 → 深度解析和清理Markdown内容
   * 4. 结构化输出 → 提供清洁、格式化的内容用于显示
   */
  const processCozeResponse = async (rawResponse: string): Promise<string> => {
    try {
      setIsProcessingData(true);
      console.log('🔄 开始四步数据处理流程...');
      
      // 步骤1: 数据接收 (已通过useCozeStream完成)
      console.log('✅ 步骤1: 数据接收完成');
      
      // 步骤2: 内容分离 - 智能识别并分离JSON和Markdown部分
      console.log('🔍 步骤2: 开始内容分离...');
      const extracted = mixedDataExtractor.extractMixedData(rawResponse);
      setExtractedData(extracted);
      
      console.log('📊 分离结果:', {
        apiCalls: extracted.apiCalls.length,
        apiResponses: extracted.apiResponses.length,
        errors: extracted.errors.length,
        markdownLength: extracted.markdownContent.length,
        hasProcessedMarkdown: !!extracted.processedMarkdown
      });

      // 检查是否有错误并进行处理
      if (extracted.errors.length > 0) {
        console.warn('⚠️ 检测到错误:', extracted.errors);
        
        // 检查是否是手相相关的错误
        const hasHandReadingError = extracted.errors.some(error => 
          JSON.stringify(error).includes('手相') || 
          JSON.stringify(error).includes('shouxiang') ||
          JSON.stringify(error).includes('can\'t convert to file')
        );
        
        if (hasHandReadingError) {
          console.log('🤚 检测到手相分析错误，将继续处理其他命理分析内容');
        }
      }
      
      // 步骤3: Markdown处理 - 深度解析和清理Markdown内容
      console.log('📝 步骤3: 开始Markdown处理...');
      let cleanedMarkdown = extracted.markdownContent;
      
      // 如果没有提取到markdown内容，尝试从原始响应中提取
      if (!cleanedMarkdown || cleanedMarkdown.length < 50) {
        console.log('🔄 Markdown内容不足，尝试备用提取方法...');
        cleanedMarkdown = mixedDataExtractor.extractMarkdownOnly(rawResponse);
      }
      
      if (extracted.processedMarkdown) {
        // 使用处理后的markdown内容
        cleanedMarkdown = extracted.processedMarkdown.cleanedContent;
        console.log('✨ 使用深度处理的Markdown内容');
      }
      
      // 步骤4: 结构化输出 - 提供清洁、格式化的内容用于显示
      console.log('🎯 步骤4: 开始结构化输出...');
      let finalContent = cleanedMarkdown;
      
      // 如果仍然没有有效内容，添加错误说明
      if (!finalContent || finalContent.length < 20) {
        finalContent = `## 命理分析报告

**数据处理状态：** 部分成功

由于技术原因，部分分析功能暂时不可用：
- 手相分析功能遇到图片处理问题
- 其他命理分析正在处理中

请稍后重试或联系技术支持。

---

**原始响应数据：**
\`\`\`
${rawResponse.substring(0, 500)}${rawResponse.length > 500 ? '...' : ''}
\`\`\``;
      }
      
      // 如果有知识卡数据，进行映射处理
      if (extracted.processedMarkdown) {
        try {
          const knowledgeCardData = knowledgeCardMapper.mapToKnowledgeCard(extracted);
          if (knowledgeCardData && knowledgeCardData.content) {
            finalContent = knowledgeCardData.content;
            console.log('🎴 知识卡映射成功');
          }
        } catch (error) {
          console.warn('⚠️ 知识卡映射失败，使用原始内容:', error);
        }
      }
      
      // 最终的智能内容处理
      const processedFinalContent = smartContentProcess(finalContent);
      setProcessedContent(processedFinalContent);
      
      console.log('✅ 四步数据处理流程完成!');
      console.log('📄 最终内容长度:', processedFinalContent.length);
      
      return processedFinalContent;
      
    } catch (error) {
      console.error('❌ 数据处理流程出错:', error);
      
      // 增强的降级处理
      let fallbackContent = '';
      
      try {
        // 尝试使用混合数据提取器的备用方法
        fallbackContent = mixedDataExtractor.extractMarkdownOnly(rawResponse);
      } catch (extractError) {
        console.error('❌ 备用提取也失败:', extractError);
      }
      
      // 如果备用提取也失败，提供基本的错误信息
      if (!fallbackContent || fallbackContent.length < 20) {
        fallbackContent = `## 命理分析报告

**处理状态：** 遇到技术问题

抱歉，当前无法完整处理您的命理分析请求。可能的原因：
1. 手相图片格式不支持或文件损坏
2. 网络连接问题
3. 服务器临时故障

**建议解决方案：**
- 请检查上传的手相图片是否清晰完整
- 稍后重试分析
- 联系技术支持获取帮助

**错误详情：**
\`\`\`
${error.message}
\`\`\``;
      }
      
      const processedFallbackContent = smartContentProcess(fallbackContent);
      setProcessedContent(processedFallbackContent);
      return processedFallbackContent;
    } finally {
      setIsProcessingData(false);
    }
  };

  // 测试数据
  const testAnalysisContent = `您好！我是玄机子，很荣幸能为您分析孩子的命理格局。根据您提供的信息，我需要先确认几个关键点：

1. **孩子的性别**：您提到"男"，确认是男孩
2. **出生时间**：公历2025年9月9日 18:05（酉时）
3. **出生地点**：北京市朝阳区
4. **手相信息**：您上传了手相照片，我会进行专业分析
5. **居住环境**：城市平原，楼房，附近有学校、法院、医院

现在让我为您进行全面的命理分析：## 【命主信息概览】
* **性别**：男
* **出生时间**：公历 2025年09月09日 18时05分
* **四柱八字**：乙巳 乙酉 辛巳 丁酉
* **紫微主星**：命宫[廉贞陷、贪狼陷、天马] | 身宫[迁移宫]
* **手型**：木形手

---

## 一、 核心命理分析报告

#### 1. 性格特质与教养指南 (天性之根)
* **核心天性洞察**：这孩子如同精雕细琢的白玉（辛金日主），天生带着贵气与敏锐，内心既有金石的坚韧（金旺身强），又有贪狼星的灵动才情。他的手相如雨后新竹（木形手），思维如穿线的针（智慧线平直），做事条理分明，但情感表达如埋在土里的芽（感情线浅淡），习惯用行动代替言语。
* **细节论证**：八字日主辛金生于酉月，金气鼎盛，主刚毅果决；紫微命宫廉贞贪狼双陷，虽多才多艺但需专注引导；手相木形手配平直智慧线，印证其逻辑思维与创造力的完美结合。
* **教养引导建议**：对于这样内在秩序感强的孩子，与其强行改变，不如顺势引导。当他专注做事时，用提问代替指挥："这个积木为什么要这样搭？"当他情绪内敛时，做他的情感翻译官："是不是因为玩具坏了很生气？我们一起修好不好？"

#### 2. 潜在天赋深掘 (天赋之苗)
* **智慧与学识**：八字金旺配紫微福德宫文昌文曲双庙，学习能力如宝剑配鞘——既有锋芒又懂收敛。适合数学推理、物理实验等需要严密逻辑的学科。
* **身体与动能**：生命线开阔饱满，精力充沛如小马达，适合跑跳、攀岩等释放能量的活动，运动时反而更能专注。
* **艺术与表达**：木形手自带审美雷达，对颜色形状极其敏感，画太阳会用橘红渐变，搭房子会用三角形屋顶，这是天生的视觉创造力。
* **综合论断**：最具潜力的是"**逻辑+创造**"双天赋，既能用脑子想清楚，又能用双手做出来，如设计会动的小玩具或写科幻小故事。

#### 3. 成长关键节点 (成长之路)
* **当前阶段 (2-14岁)**：大运甲申，金水相生，是培养思考习惯的黄金期。重点不是死记硬背，而是教会"怎么想"：做数学题时问方法，读故事时问情节发展。
* **未来展望 (15-24岁)**：大运癸未，紫微化科破军旺，创造力将大爆发。此阶段情感也会从内敛变丰富，需要家长用共情代替说教。

---

### 二、 天赋挖掘与成长建议

#### 1. 地域适配建议 (地利之选)
* **环境能量匹配**：您提到的学校、法院、医院环境极佳！学校属文昌之地，正好补益福德宫文昌文曲；法院属金，与八字金旺相得益彰，培养秩序感；医院属水，能泄金之秀气，让孩子刚中带柔。
* **学习/生活优选地域**：适合近水之地或文化氛围浓厚的城市，如杭州、苏州等，水能泄金秀，文能养才情。

#### 2. 学业方向指引 (文理之道)
* **学科偏向**：强烈偏向**理科+艺术**的组合。数学、物理、信息技术等需要逻辑推理的学科为主，美术、设计等创造性学科为辅，完美匹配"逻辑+创造"双天赋。

#### 3. 兴趣培养清单 (怡情之艺)
* **首选推荐**：
  - **乐高机械组/少儿编程**：用逻辑想结构，用创造做作品，完美契合天赋
  - **水彩画/国画**：木形手的审美敏感度能让他在艺术中找到独特表达
  - **围棋**：锻炼逻辑思维，适合爱思考的天性
* **次选参考**：
  - **武术/攀岩**：释放充沛精力，培养专注力
  - **传统工艺**：如篆刻、木工，既能动手又能静心

#### 4. 未来行业适配参考 (成事之途)
* **核心领域**：
  - **工业设计/产品设计**：用逻辑想用户需求，用创造做好看实用的产品
  - **游戏开发**：编程逻辑+美术创造的完美结合
  - **教育科技**：开发寓教于乐的学习工具，既能发挥技术又能理解孩子心理

---

### 【玄机子大师结语】

此子命格，如金玉之质待雕琢，木秀之手待生发。金旺显其坚毅，木形示其灵秀，文昌文曲佑其才情，学校法院护其成长。教养之道，贵在顺势：当他沉思时，莫扰其静；当他创造时，助其成真；当他内敛时，译其心情。天地人三才相应，已是难得之局，唯需以耐心为水，以理解为土，让这株金木双秀的奇才，既能逻辑如剑，锋利断金，又能创造如春，生机勃发。

**注**：本分析仅为基于传统命理学的文化参考，旨在因材施教，不构成绝对决策依据。愿您以爱与智慧，陪伴孩子探索独一无二的人生道路。

---`;

  // 生成分析内容 - 现在调用扣子智能体并集成四步数据处理流程
  const generateAnalysisContent = async () => {
    if (!formData) return '';
    
    // 将formData转换为BirthInfo格式
    const birthInfo: BirthInfo = {
      gender: formData.gender,
      calendar: formData.calendar,
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      isLeapMonth: formData.isLeapMonth,
      birthPlace: formData.birthPlace,
      birthEnvironment: formData.birthEnvironment,
      age: formData.age,
      palmReading: formData.palmReading,
      palmReadingFile: formData.palmReadingFile
    };

    try {
      // 调用扣子智能体进行分析
      await startBirthAnalysis(birthInfo);
      
      // 返回初始提示信息
      return `正在调用扣子智能体进行专业命理分析...

根据您提供的信息：
- 性别：${formData.gender === 'male' ? '男孩' : '女孩'}
- 出生时间：${formData.calendar === 'solar' ? '公历' : '农历'}${formData.birthDate} ${formData.birthTime}
- 出生地点：${formData.birthPlace}
- 居住环境：${formData.birthEnvironment}
- 年龄：${formData.age}岁
${formData.palmReading ? '- 手相信息：已上传手相照片' : ''}

智能体正在基于知识库进行深度分析，请稍候...`;
    } catch (error) {
      console.error('调用扣子智能体失败:', error);
      return `调用扣子智能体时出现错误：${error instanceof Error ? error.message : '未知错误'}`;
    }
  };

  // 如果有传递的图片URL，自动显示
  useEffect(() => {
    if (generatedImageUrl) {
      setShowAIImage(true);
    }
  }, [generatedImageUrl]);

  // 如果来自生日页面，自动开始AI分析
  useEffect(() => {
    if (fromBirthday && formData) {
      // 无论是否在BirthdayForm中启动过，都在ReportPage中重新启动
      // 这样可以确保流式响应被正确监听
      handleStartAIAnalysis();
    }
  }, [fromBirthday, formData]);

  // 监听流式分析完成，自动调用 Moonshot API 生成 HTML 知识卡
  useEffect(() => {
    console.log('监听流式完成状态:', {
      isStreaming: isStreaming,
      messagesLength: messages.length,
      hasGeneratedHTML: !!moonshotState.generatedHTML,
      latestMessage: messages.length > 0 ? messages[messages.length - 1]?.substring(0, 100) + '...' : 'none'
    });
    
    if (!isStreaming && messages.length > 0 && !moonshotState.generatedHTML) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.trim()) {
        console.log('扣子分析完成，开始调用 Moonshot API 生成 HTML 知识卡...');
        console.log('分析内容长度:', latestMessage.length);
        generateKnowledgeCard(latestMessage).catch(error => {
          console.error('自动生成 HTML 知识卡失败:', error);
        });
      } else {
        console.log('最新消息为空，跳过 Moonshot API 调用');
      }
    } else {
      console.log('不满足调用 Moonshot API 的条件');
    }
  }, [isStreaming, messages, moonshotState.generatedHTML]);

  // 超时检测：如果分析超过3分钟，自动显示超时错误
  useEffect(() => {
    if (isStreaming) {
      const timeoutTimer = setTimeout(() => {
        setAiAnalysisResult('分析超时：扣子智能体响应时间过长，请稍后重试。可能的原因：网络连接问题、API服务繁忙或token配置错误。');
        // 停止流式处理
        stopStream();
        setIsAnalyzing(false);
      }, 180000); // 3分钟超时
      
      return () => clearTimeout(timeoutTimer);
    }
  }, [isStreaming, stopStream]);

  // 监听扣子流式响应并集成四步数据处理流程
  useEffect(() => {
    if (currentMessage) {
      // 实时更新当前流式消息
      setAiAnalysisResult(prev => {
        // 如果是初始提示信息，替换为流式内容
        if (prev.includes('正在调用扣子智能体进行专业命理分析')) {
          return currentMessage;
        }
        return currentMessage;
      });
    }
    
    // 当有完整消息时，应用四步数据处理流程
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      // 应用四步数据处理流程
      processCozeResponse(latestMessage).then(processedContent => {
        setAiAnalysisResult(processedContent);
      }).catch(error => {
        console.error('四步数据处理失败:', error);
        setAiAnalysisResult(latestMessage); // 降级使用原始内容
      });
    }

    // 处理错误
     if (streamError) {
       let errorMessage = streamError;
      
      // 针对特定错误提供更友好的提示
      if (errorMessage.includes('图片文件格式不正确')) {
        errorMessage = '手相图片格式有误，请重新上传清晰的手相照片（支持JPG、PNG格式）';
      } else if (errorMessage.includes('请求参数有误')) {
        errorMessage = '输入信息有误，请检查生日信息是否完整正确';
      } else if (errorMessage.includes('分析服务暂时不可用')) {
        errorMessage = '智能分析服务暂时不可用，请稍后重试';
      } else if (errorMessage.includes('网络连接异常')) {
        errorMessage = '网络连接不稳定，请检查网络后重试';
      }
      
      setAiAnalysisResult(`分析遇到问题：${errorMessage}\n\n请尝试以下解决方案：\n1. 检查网络连接是否正常\n2. 如果上传了手相图片，请确保图片清晰且格式正确\n3. 稍后重新尝试分析\n4. 如问题持续，请联系客服`);
      setIsAnalyzing(false);
    }

    // 流式传输完成
    if (!isStreaming && messages.length > 0) {
      setIsAnalyzing(false);
    }
  }, [isStreaming, currentMessage, messages, streamError]);

  // 开始AI分析 - 使用扣子智能体
  const handleStartAIAnalysis = async () => {
    setIsAnalyzing(true);
    setShowAIImage(true);
    
    try {
      // 调用扣子智能体进行分析
      const initialContent = await generateAnalysisContent();
      setAiAnalysisResult(initialContent);
    } catch (error) {
      console.error('AI分析失败:', error);
      setAiAnalysisResult(`分析失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    setIsAnalyzing(false);
  };

  // 重新生成知识卡 - 使用现有的扣子分析结果
  const handleRegenerateKnowledgeCard = async () => {
    try {
      // 获取最新的分析内容
      let contentToUse = '';
 // 优先使用流式处理的内容
    if (messages.length > 0) {
      contentToUse = messages[messages.length - 1];
      } else if (aiAnalysisResult) {
        contentToUse = aiAnalysisResult;
      }
      
      if (contentToUse && contentToUse.trim()) {
        console.log('使用现有分析结果重新生成 HTML 知识卡...');
        await generateKnowledgeCard(contentToUse);
      } else {
        // 如果没有现有内容，则重新启动分析
        console.log('没有现有分析结果，重新启动分析...');
        clearMessages();
        setAiAnalysisResult('');
        await handleStartAIAnalysis();
      }
    } catch (error) {
      console.error('重新生成知识卡失败:', error);
    }
  };

  // 测试功能 - 生产环境已注释
  // const handleTestWithSampleData = async () => {
  //   setIsAnalyzing(true);
  //   setShowAIImage(true);
  //   await generateKnowledgeCardStream(testAnalysisContent);
  //   setIsAnalyzing(false);
  // };


  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1.0));
  };

  const handleDownload = async () => {
    try {
      const reportElement = document.querySelector('.report-content') as HTMLElement;
      if (!reportElement) {
        console.error('报告内容元素未找到');
        return;
      }

      // 创建canvas并截图
      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高图片质量
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight,
      });

      // 转换为图片并下载
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = '解读报告卡.png';
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 生成 AI 知识卡 - 使用扣子智能体 + Moonshot API
  const handleGenerateKnowledgeCard = async () => {
    try {
      setIsAnalyzing(true);
      setShowAIImage(true);
      clearMessages(); // 清除之前的消息
      
      // 第一步：调用扣子智能体生成分析内容
      const initialContent = await generateAnalysisContent();
      setAiAnalysisResult(initialContent);
      
      // 第二步：将扣子分析结果传递给 Moonshot API 生成 HTML 知识卡
      if (initialContent && initialContent.trim()) {
        console.log('开始调用 Moonshot API 生成 HTML 知识卡...');
        await generateKnowledgeCard(initialContent);
      }
    } catch (error) {
      console.error('生成知识卡失败:', error);
      setAiAnalysisResult(`生成知识卡失败：${error instanceof Error ? error.message : '未知错误'}`);
      setIsAnalyzing(false);
      
      // 提供更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes('Token格式不正确')) {
          console.error('扣子API Token配置错误，请检查环境变量设置');
        } else if (error.message.includes('Failed to fetch')) {
          console.error('网络连接失败，请检查网络连接或稍后重试');
        }
      }
    }
  };

  // 清空知识卡内容
  const handleClearKnowledgeCard = () => {
    clearMoonshotContent();
    setShowAIImage(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Left Half - Traditional Image */}
      <div className="w-1/2 relative">
        <img
          src="/lovable-uploads/f809b3b5-d2c0-469f-9360-82e40e0ad5da.png"
          alt="Traditional Chinese Wisdom Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Right Half - Report Content */}
      <div className="w-1/2 relative overflow-y-auto" style={{ backgroundColor: '#9c5537' }}>
        {/* Back Button */}
        <Link
          to="/birthday"
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-2 z-10"
        >
          <ArrowLeft className="w-5 h-5 text-amber-800" />
          <span className="text-amber-800 text-sm">返回上一页</span>
        </Link>

        <div className="p-6 pt-16">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-4">解读报告卡</h1>
          </div>

          {/* 生成状态提示 - 在卡片上方 */}
          {fromBirthday && showAnalyzeHint && (isAnalyzing || isStreaming || isProcessingData) && (
            <div className="mb-6 mx-4">
              {(isAnalyzing || isStreaming || isProcessingData) ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-blue-800 font-medium">
                      {isProcessingData 
                        ? '正在处理数据（内容分离→Markdown处理→结构化输出）...' 
                        : '扣子智能体正在基于知识库为您深度分析...'
                      }
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">
                    {isProcessingData 
                      ? '四步数据处理流程进行中' 
                      : '请稍等一盏茶的工夫'
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">智能体分析完成</span>
                  </div>
                  <p className="text-sm text-green-600">知识卡已生成完成</p>
                </div>
              )}
            </div>
          )}
          
          {/* Main Report Card - Scrollable */}
          <div className="bg-white rounded-2xl shadow-xl mx-4 max-h-[75vh] overflow-y-auto mb-4">
            {/* Card Header with Controls */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl z-50 shadow-sm">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleZoomIn}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold"
                >
                  +
                </button>
                <button 
                  onClick={handleZoomOut}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold"
                >
                  -
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  to="/deeptalk" 
                  state={{ 
                    formData: formData, 
                    analysisContent: analysisContent,
                    moonshotResult: moonshotState.generatedHTML || moonshotState.streamContent
                  }}
                >
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    深度咨询
                  </button>
                </Link>
                <button 
                  onClick={handleDownload}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                >
                  下载
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div 
              className="p-8 transition-transform duration-300 origin-top-left report-content"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* 生成状态提示 */}
              {(isStreaming || isProcessingData) && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="text-lg font-medium text-blue-800">
                      {isProcessingData 
                        ? '正在进行四步数据处理流程...' 
                        : '扣子智能体正在基于知识库生成知识卡...'
                      }
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">
                    {isProcessingData 
                      ? '数据接收→内容分离→Markdown处理→结构化输出' 
                      : '请稍候片刻'
                    }
                  </p>
                </div>
              )}

              {/* 错误状态 */}
               {streamError && (
                 <div className="flex flex-col items-center justify-center py-12">
                   <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
                     <div className="text-center">
                       <div className="text-red-600 font-medium mb-2">AI分析失败</div>
                       <div className="text-sm text-red-500 mb-4">{streamError}</div>
                      <div className="text-xs text-gray-600 mb-4">
                        <p className="mb-2">可能的解决方案：</p>
                        <ul className="text-left space-y-1">
                          <li>• 检查网络连接是否正常</li>
                          <li>• 稍后重试，API服务可能暂时繁忙</li>
                          <li>• 如果问题持续，请联系技术支持</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={handleRegenerateKnowledgeCard}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        重新分析
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 流式内容显示 */}
              {isStreaming && currentMessage && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">扣子智能体正在生成中...</h3>
                    <div className="h-32 overflow-y-auto">
                      <div className="text-xs text-blue-700 whitespace-pre-wrap font-mono">
                        {currentMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 实时渲染HTML内容 - 流式过程中 */}
              {isStreaming && processedHTML && (
                <div className="mb-6">
                  <div 
                    className="knowledge-card-content prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: processedHTML
                    }}
                  />
                </div>
              )}

              {/* 优先显示 Moonshot 生成的 HTML 知识卡 */}
              {!isStreaming && moonshotState.generatedHTML && (
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-1">
                    <div 
                      className="knowledge-card-content"
                      dangerouslySetInnerHTML={{ __html: moonshotState.generatedHTML }}
                    />
                  </div>
                </div>
              )}

              {/* 如果没有 Moonshot HTML，则显示流式完成后的内容 */}
              {!isStreaming && !moonshotState.generatedHTML && processedHTML && (
                <div className="mb-6">
                  <div 
                    className="knowledge-card-content prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: processedHTML
                    }}
                  />
                </div>
              )}

              {/* 显示AI分析结果 - 如果没有其他内容的话 */}
              {!isStreaming && !moonshotState.generatedHTML && messages.length === 0 && aiAnalysisResult && (
                <div className="mb-6">
                  <div 
                    className="knowledge-card-content prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: addMarkdownStyles(smartContentProcess(aiAnalysisResult))
                    }}
                  />
                </div>
              )}

              {/* 空状态 - 显示默认图片 */}
               {!isStreaming && messages.length === 0 && !aiAnalysisResult && !streamError && (
                <div className="flex flex-col items-center justify-center">
                  <img 
                    src="/lovable-uploads/f705bd19-34cd-4afa-894e-12b414403c8e.png" 
                    alt="命理分析报告"
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮区域 */}
          {moonshotState.generatedHTML && (
            <div className="mb-6 mx-4">
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleRegenerateKnowledgeCard}
                  disabled={moonshotState.isGenerating || moonshotState.isStreaming}
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  重新生成
                </Button>
                <Button 
                  onClick={handleClearKnowledgeCard}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  清空内容
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportPage;