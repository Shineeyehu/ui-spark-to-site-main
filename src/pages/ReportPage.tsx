import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Star, TrendingUp, CheckCircle, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useMoonshot } from '@/hooks/use-moonshot';
import { useCozeStream } from '@/hooks/use-coze-stream';
import { smartContentProcess, addMarkdownStyles, markdownToHtml, extractOverviewSection, cleanCozeNoise, stripOverviewFromHtml } from '@/lib/markdown-utils';
import { generateKnowledgeCardHTML, extractKnowledgeCardData, generateOverviewHTML, generateRemainingContentHTML } from '@/lib/knowledge-card-processor';
import type { BirthInfo } from '@/lib/coze-api';

const ReportPage = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAIImage, setShowAIImage] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalyzeHint, setShowAnalyzeHint] = useState(true);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const location = useLocation();
  
  // 使用Moonshot API Hook
  const {
    moonshotState,
    generateKnowledgeCard,
    generateKnowledgeCardStream,
    clearError: clearMoonshotError,
    clearContent: clearMoonshotContent,
    setExternalHTML
  } = useMoonshot({
    apiKey: import.meta.env.VITE_MOONSHOT_API_KEY || '',
    model: import.meta.env.VITE_MOONSHOT_MODEL || 'kimi-k2-0905-preview',
    baseUrl: import.meta.env.VITE_MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1'
  });

  // 使用扣子API Hook
  const {
    streamState,
    startBirthAnalysis,
    stopStream,
    clearMessages
  } = useCozeStream();

  // 从路由状态获取传递的数据
  const { 
    generatedImageUrl, 
    formData, 
    analysisContent, 
    fromBirthday, 
    startAnalysis,
    moonshotResult,
    inlineReportHtml: externalInlineReportHtml,
    fromDeepTalk
  } = location.state || {};
  
  // 调试：打印接收到的数据
  useEffect(() => {
    console.log('=== ReportPage 数据接收调试 ===');
    console.log('location.state:', location.state);
    console.log('formData:', formData);
    console.log('fromBirthday:', fromBirthday);
    console.log('analysisContent:', analysisContent);
    console.log('generatedImageUrl:', generatedImageUrl);
    console.log('startAnalysis:', startAnalysis);
    console.log('moonshotResult:', moonshotResult);
    console.log('externalInlineReportHtml:', externalInlineReportHtml);
    console.log('fromDeepTalk:', fromDeepTalk);
    console.log('=== 调试结束 ===');
  }, []);

  // 检查是否有有效数据
  const hasValidData = useMemo(() => {
    return !!(
      formData || 
      analysisContent || 
      moonshotResult || 
      externalInlineReportHtml ||
      streamState.messages.length > 0 ||
      aiAnalysisResult ||
      moonshotState.generatedHTML
    );
  }, [formData, analysisContent, moonshotResult, externalInlineReportHtml, streamState.messages.length, aiAnalysisResult, moonshotState.generatedHTML]);

  // 如果没有数据且不是从其他页面跳转，自动重定向到生日页面
  useEffect(() => {
    if (!hasValidData && !fromBirthday && !fromDeepTalk) {
      console.log('ReportPage: 没有有效数据，3秒后自动跳转到生日页面');
      const timer = setTimeout(() => {
        window.location.href = '/birthday';
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasValidData, fromBirthday, fromDeepTalk]);
  
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

  // 处理从 DeepTalkPage 返回的数据：优先还原在深度咨询内联展示的完整报告 HTML
  useEffect(() => {
    if (!fromDeepTalk) return;

    // 优先级：inlineReportHtml（完整内联报告） > moonshotResult（仅正文HTML/片段）
    const htmlFromDeepTalk = externalInlineReportHtml || moonshotResult;
    if (htmlFromDeepTalk) {
      console.log('从深度咨询返回，恢复报告HTML（优先 inlineReportHtml）');
      setExternalHTML(htmlFromDeepTalk);
    }
  }, [fromDeepTalk, externalInlineReportHtml, moonshotResult, setExternalHTML]);
  
  // 移除测试数据，使用真实的分析结果

  // 生成分析内容 - 现在调用智能体
  const generateAnalysisContent = async () => {
    console.log('=== generateAnalysisContent 开始 ===');
    console.log('formData:', formData);
    
    if (!formData) {
      console.log('formData 为空，返回空字符串');
      return '';
    }
    
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

    console.log('转换后的 birthInfo:', birthInfo);

    try {
      // 调用智能体进行分析
      console.log('调用 startBirthAnalysis...');
      await startBirthAnalysis(birthInfo);
      console.log('startBirthAnalysis 调用完成');
      
      // 返回初始提示信息
      const initialMessage = `正在调用智能体进行专业命理分析...

根据您提供的信息：
- 性别：${formData.gender === 'male' ? '男孩' : '女孩'}
- 出生时间：${formData.calendar === 'solar' ? '公历' : '农历'}${formData.birthDate} ${formData.birthTime}
- 出生地点：${formData.birthPlace}
- 居住环境：${formData.birthEnvironment}
- 年龄：${formData.age}岁
${formData.palmReading ? '- 手相信息：已上传手相照片' : ''}

智能体正在基于知识库进行深度分析，请稍候...`;
      
      console.log('返回初始消息:', initialMessage);
      return initialMessage;
    } catch (error) {
      console.error('调用智能体失败:', error);
      const errorMessage = `调用智能体时出现错误：${error instanceof Error ? error.message : '未知错误'}`;
      console.log('返回错误消息:', errorMessage);
      return errorMessage;
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
      console.log('检测到来自生日页面，开始AI分析...');
      // 无论是否在BirthdayForm中启动过，都在ReportPage中重新启动
      // 这样可以确保流式响应被正确监听
      handleStartAIAnalysis();
      
      // 移除测试数据回退机制，使用真实的分析结果
    }
  }, [fromBirthday, formData]);

  // 监听流式分析完成，自动生成知识卡片HTML
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);
  
  useEffect(() => {
    console.log('监听流式完成状态:', {
      isStreaming: streamState.isStreaming,
      messagesLength: streamState.messages.length,
      hasGeneratedHTML: !!moonshotState.generatedHTML,
      hasAutoGenerated,
      latestMessage: streamState.messages.length > 0 ? streamState.messages[streamState.messages.length - 1]?.substring(0, 100) + '...' : 'none'
    });
    
    // 添加防重复生成的标志
    if (!streamState.isStreaming && 
        streamState.messages.length > 0 && 
        !moonshotState.generatedHTML && 
        !hasAutoGenerated) {
      const latestMessage = streamState.messages[streamState.messages.length - 1];
      if (latestMessage && latestMessage.trim()) {
        console.log('扣子分析完成，开始生成知识卡片HTML...');
        console.log('分析内容长度:', latestMessage.length);
        setHasAutoGenerated(true); // 设置标志防止重复生成
        
        // 使用新的知识卡片处理器生成HTML
        try {
          const knowledgeCardHTML = generateKnowledgeCardHTML(latestMessage);
          setExternalHTML(knowledgeCardHTML);
          console.log('知识卡片HTML生成完成');
        } catch (error) {
          console.error('生成知识卡片HTML失败:', error);
          setHasAutoGenerated(false); // 失败时重置标志
        }
      } else {
        console.log('最新消息为空，跳过知识卡片生成');
      }
    } else {
      console.log('不满足生成知识卡片的条件');
    }
  }, [streamState.isStreaming, streamState.messages.length, moonshotState.generatedHTML, hasAutoGenerated, setExternalHTML]);

  // 超时检测：如果分析超过3分钟，自动显示超时错误
  useEffect(() => {
    if (streamState.isStreaming) {
      const timeoutTimer = setTimeout(() => {
        setAiAnalysisResult('分析超时：智能体响应时间过长，请稍后重试。可能的原因：网络连接问题、API服务繁忙或token配置错误。');
        // 停止流式处理
        stopStream();
        setIsAnalyzing(false);
      }, 180000); // 3分钟超时
      
      return () => clearTimeout(timeoutTimer);
    }
  }, [streamState.isStreaming, stopStream]);

  // 监听扣子流式响应 - 优化版本，避免频繁更新
  useEffect(() => {
    // 处理错误
    if (streamState.error) {
      setAiAnalysisResult(`智能体分析出错：${streamState.error}`);
      setIsAnalyzing(false);
      return;
    }

    // 流式传输完成时更新最终结果
    if (!streamState.isStreaming && streamState.messages.length > 0) {
      const latestMessage = streamState.messages[streamState.messages.length - 1];
      setAiAnalysisResult(latestMessage);
      setIsAnalyzing(false);
      return;
    }

    // 只在流式传输过程中更新当前消息（减少更新频率）
    if (streamState.isStreaming && streamState.currentMessage) {
      // 使用防抖机制，避免过于频繁的更新
      const timeoutId = setTimeout(() => {
        setAiAnalysisResult(prev => {
          // 如果是初始提示信息，替换为流式内容
          if (prev.includes('正在调用智能体进行专业命理分析')) {
            return streamState.currentMessage;
          }
          return streamState.currentMessage;
        });
      }, 100); // 100ms防抖

      return () => clearTimeout(timeoutId);
    }
  }, [streamState.error, streamState.isStreaming, streamState.messages.length, streamState.currentMessage]);

  // 开始AI分析 - 使用智能体
  const handleStartAIAnalysis = async () => {
    console.log('=== 开始AI分析 ===');
    console.log('formData:', formData);
    console.log('当前流式状态:', streamState);
    
    setIsAnalyzing(true);
    setShowAIImage(true);
    
    try {
      // 调用智能体进行分析
      console.log('调用 generateAnalysisContent...');
      const initialContent = await generateAnalysisContent();
      console.log('generateAnalysisContent 返回:', initialContent);
      setAiAnalysisResult(initialContent);
    } catch (error) {
      console.error('AI分析失败:', error);
      setAiAnalysisResult(`分析失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    setIsAnalyzing(false);
    console.log('=== AI分析结束 ===');
  };

  // 重新生成知识卡 - 进行全局刷新重新获取
  const handleRegenerateKnowledgeCard = async () => {
    try {
      console.log('开始全局刷新重新获取...');
      
      // 重置所有状态
      setHasAutoGenerated(false);
      setAiAnalysisResult('');
      setIsAnalyzing(false);
      setShowAIImage(false);
      
      // 清除所有消息和内容
      clearMessages();
      clearMoonshotContent();
      
      // 等待一小段时间确保状态重置完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 重新开始AI分析
      console.log('重新启动AI分析...');
      await handleStartAIAnalysis();
      
      console.log('全局刷新重新获取完成');
    } catch (error) {
      console.error('全局刷新重新获取失败:', error);
      setAiAnalysisResult(`重新获取失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 测试功能已移除，使用真实数据


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

  // 生成 AI 知识卡 - 使用智能体 + 知识卡片处理器
  const handleGenerateKnowledgeCard = async () => {
    try {
      setIsAnalyzing(true);
      setShowAIImage(true);
      clearMessages(); // 清除之前的消息
      
      // 第一步：调用智能体生成分析内容
      const initialContent = await generateAnalysisContent();
      setAiAnalysisResult(initialContent);
      
      // 第二步：使用知识卡片处理器生成HTML
      if (initialContent && initialContent.trim()) {
        console.log('开始生成知识卡片HTML...');
        const knowledgeCardHTML = generateKnowledgeCardHTML(initialContent);
        setExternalHTML(knowledgeCardHTML);
        console.log('知识卡片HTML生成完成');
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
    setHasAutoGenerated(false); // 重置自动生成标志
  };

  const overviewHtml = useMemo(() => {
    let candidate = '';
    // 优先使用"已完成的完整文本"，其次使用"流式增量"，最后兜底 aiAnalysisResult
    if (streamState.messages.length > 0) {
      candidate = streamState.messages.join('\n\n');
    } else if (streamState.currentMessage) {
      candidate = streamState.currentMessage;
    } else if (aiAnalysisResult) {
      candidate = aiAnalysisResult;
    }
    if (!candidate) return '';
    
    // 使用新的知识卡片处理器提取概览数据
    const cardData = extractKnowledgeCardData(candidate);
    return generateOverviewHTML(cardData.overview);
  }, [streamState.currentMessage, streamState.messages.length, aiAnalysisResult]);

  // 生成去重/净化后的正文 HTML（不包含概览，且清理噪声）
  const streamingBodyHtml = useMemo(() => {
    if (!streamState.isStreaming || !streamState.currentMessage) return '';
    return generateRemainingContentHTML(streamState.currentMessage);
  }, [streamState.isStreaming, streamState.currentMessage]);

  const finalBodyHtml = useMemo(() => {
    if (streamState.isStreaming || streamState.messages.length === 0) return '';
    const joined = streamState.messages.join('\n\n');
    return generateRemainingContentHTML(joined);
  }, [streamState.isStreaming, streamState.messages.length]);

  const aiBodyHtml = useMemo(() => {
    if (streamState.isStreaming || streamState.messages.length > 0 || !aiAnalysisResult) return '';
    return generateRemainingContentHTML(aiAnalysisResult);
  }, [streamState.isStreaming, streamState.messages.length, aiAnalysisResult]);

  // 供“深度咨询”内联展示的完整报告 HTML（优先 Moonshot，否则用概览+正文组合）
  const inlineReportHtml = useMemo(() => {
    if (moonshotState.generatedHTML) return moonshotState.generatedHTML;
    const parts: string[] = [];
    if (overviewHtml) parts.push(`<section class="mb-4">${overviewHtml}</section>`);
    const body = finalBodyHtml || streamingBodyHtml || aiBodyHtml;
    if (body) parts.push(`<section>${body}</section>`);
    if (parts.length === 0) return '';
    // 最小 HTML 包裹，隔离在 iframe 中使用
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:12px;background:#fffaf3;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${parts.join('')}<style>body{color:#1f2937} h1,h2,h3{color:#92400e}</style></body></html>`;
  }, [moonshotState.generatedHTML, overviewHtml, finalBodyHtml, streamingBodyHtml, aiBodyHtml]);

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
          {fromBirthday && showAnalyzeHint && (isAnalyzing || streamState.isStreaming) && (
            <div className="mb-6 mx-4">
              {(isAnalyzing || streamState.isStreaming) ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-blue-800 font-medium">智能体正在基于知识库为您深度分析...</span>
                  </div>
                  <p className="text-sm text-blue-600">请稍等一盏茶的工夫</p>
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
                    moonshotResult: moonshotState.generatedHTML || moonshotState.streamContent,
                    inlineReportHtml // 新增：用于深度咨询侧内联 iframe 展示
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
              {/* 概览优先展示：从当前可用文本中精准提取“命主信息概览” */}
              {overviewHtml && (
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-1">
                    <div
                      className="knowledge-card-content"
                      dangerouslySetInnerHTML={{ __html: overviewHtml }}
                    />
                  </div>
                </div>
              )}

              {/* 生成状态提示 */}
              {streamState.isStreaming && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="text-lg font-medium text-blue-800">
                      智能体正在基于知识库生成知识卡...
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">请稍候片刻</p>
                </div>
              )}

              {/* 错误状态 */}
              {streamState.error && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
                    <div className="text-center">
                      <div className="text-red-600 font-medium mb-2">AI分析失败</div>
                      <div className="text-sm text-red-500 mb-4">{streamState.error}</div>
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
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? '重新获取中...' : '重新获取'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 流式内容显示 */}
              {streamState.isStreaming && streamState.currentMessage && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">智能体正在生成中...</h3>
                    <div className="h-32 overflow-y-auto">
                      <div className="text-xs text-blue-700 whitespace-pre-wrap font-mono">
                        {streamState.currentMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 实时渲染HTML内容 - 流式过程中 */}
              {streamState.isStreaming && streamingBodyHtml && (
                <div className="mb-6">
                  <div 
                    className="knowledge-card-content prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{ __html: streamingBodyHtml }}
                  />
                </div>
              )}

              {/* 优先显示 Moonshot 生成的 HTML 知识卡 */}
              {!streamState.isStreaming && moonshotState.generatedHTML && (
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
              {!streamState.isStreaming && !moonshotState.generatedHTML && streamState.messages.length > 0 && finalBodyHtml && (
                <div className="mb-6">
                  <div 
                    className="knowledge-card-content prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{ __html: finalBodyHtml }}
                  />
                </div>
              )}

              {/* 显示AI分析结果 - 如果没有其他内容的话 */}
              {!streamState.isStreaming && !moonshotState.generatedHTML && streamState.messages.length === 0 && aiBodyHtml && (
                <div className="mb-6">
                  <div 
                    className="knowledge-card-content prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{ __html: aiBodyHtml }}
                  />
                </div>
              )}


              {/* 无数据状态 - 显示引导信息 */}
              {!hasValidData && !streamState.isStreaming && !streamState.error && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-center max-w-lg mx-auto">
                    <div className="mb-6">
                      <img 
                        src="/lovable-uploads/f705bd19-34cd-4afa-894e-12b414403c8e.png" 
                        alt="命理分析报告"
                        className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">欢迎来到命理分析报告</h3>
                    <p className="text-gray-600 mb-6">
                      请先填写出生信息，系统将为您生成个性化的命理分析报告
                    </p>
                    <div className="space-y-3">
                      <Link 
                        to="/birthday"
                        className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        开始分析
                      </Link>
                      <div className="text-sm text-gray-500">
                        或使用深度咨询功能获得更详细的分析
                      </div>
                      {!fromBirthday && !fromDeepTalk && (
                        <div className="mt-4 text-xs text-gray-400">
                          3秒后自动跳转到分析页面...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 空状态 - 显示默认图片（当且仅当无任何已生成内容，且非深度咨询返回）*/}
              {!streamState.isStreaming && !moonshotState.generatedHTML && streamState.messages.length === 0 && !aiAnalysisResult && !streamState.error && !fromDeepTalk && hasValidData && (
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
                  disabled={moonshotState.isGenerating || moonshotState.isStreaming || isAnalyzing}
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  重新获取
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