import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Star, TrendingUp, CheckCircle, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useMoonshot } from '@/hooks/use-moonshot';
import { smartContentProcess, addMarkdownStyles } from '@/lib/markdown-utils';

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
    clearContent: clearMoonshotContent
  } = useMoonshot({
    apiKey: 'sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e',
    model: 'kimi-k2-0905-preview',
    baseUrl: 'https://api.moonshot.cn/v1'
  });

  // 从路由状态获取传递的数据
  const { generatedImageUrl, formData, analysisContent, fromBirthday } = location.state || {};
  
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

  // 生成分析内容
  const generateAnalysisContent = () => {
    if (!formData) return '';
    
    return `您好！我是玄机子，很荣幸能为您分析孩子的命理格局。根据您提供的信息，我需要先确认几个关键点：

1. **孩子的性别**：您提到"${formData.gender === 'male' ? '男' : '女'}"，确认是${formData.gender === 'male' ? '男孩' : '女孩'}
2. **出生时间**：${formData.calendar === 'solar' ? '公历' : '农历'}${formData.birthDate} ${formData.birthTime}
3. **出生地点**：${formData.birthPlace}
4. **手相信息**：${formData.palmReading ? '您上传了手相照片，我会进行专业分析' : '暂无手相信息'}
5. **居住环境**：${formData.birthEnvironment}
6. **年龄**：${formData.age}岁

现在让我为您进行全面的命理分析：`;
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
      handleStartAIAnalysis();
    }
  }, [fromBirthday, formData]);

  // 开始AI分析
  const handleStartAIAnalysis = async () => {
    setIsAnalyzing(true);
    setShowAIImage(true);
    
    // 生成分析内容并调用Moonshot API
    const analysisContent = generateAnalysisContent();
    await generateKnowledgeCardStream(analysisContent);
    
    setIsAnalyzing(false);
  };

  // 重新生成知识卡
  const handleRegenerateKnowledgeCard = async () => {
    const analysisContent = generateAnalysisContent();
    await generateKnowledgeCardStream(analysisContent);
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

  // 生成 AI 知识卡
  const handleGenerateKnowledgeCard = async () => {
    try {
      clearMoonshotError();
      setShowAIImage(true);
      
      // 生成分析内容
      const analysisContent = generateAnalysisContent();
      await generateKnowledgeCardStream(analysisContent);
    } catch (error) {
      console.error('生成知识卡失败:', error);
      // 提供更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes('API Key 未配置')) {
          console.error('API配置错误，请检查环境变量设置');
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
          {fromBirthday && showAnalyzeHint && (isAnalyzing || moonshotState.isGenerating || moonshotState.isStreaming) && (
            <div className="mb-6 mx-4">
              {(isAnalyzing || moonshotState.isGenerating || moonshotState.isStreaming) ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-blue-800 font-medium">贫道正在静心起盘，倾力为您剖析。</span>
                  </div>
                  <p className="text-sm text-blue-600">请稍等一盏茶的工夫</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">AI 分析完成</span>
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
              {(moonshotState.isGenerating || moonshotState.isStreaming) && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="text-lg font-medium text-blue-800">
                      {moonshotState.isGenerating ? 'AI 正在生成知识卡...' : 'AI 正在流式生成知识卡...'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">请稍候片刻</p>
                </div>
              )}

              {/* 错误状态 */}
              {moonshotState.error && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="text-center">
                      <div className="text-red-600 font-medium mb-2">生成失败</div>
                      <div className="text-sm text-red-500 mb-4">{moonshotState.error}</div>
                      <Button 
                        onClick={handleRegenerateKnowledgeCard}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        重新生成
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 流式内容显示 */}
              {moonshotState.isStreaming && moonshotState.streamContent && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">正在生成中...</h3>
                    <div className="h-32 overflow-y-auto">
                      <div className="text-xs text-blue-700 whitespace-pre-wrap font-mono">
                        {moonshotState.streamContent}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 实时渲染HTML内容 - 流式过程中 */}
              {moonshotState.isStreaming && moonshotState.streamContent && (
                <div className="mb-6">
                  <div 
                    className="knowledge-card-content prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: addMarkdownStyles(smartContentProcess(moonshotState.streamContent))
                    }}
                  />
                </div>
              )}

              {/* 最终渲染HTML内容 - 流式完成后 */}
              {!moonshotState.isStreaming && moonshotState.generatedHTML && (
                <div className="mb-6">
                  <div 
                    className="knowledge-card-content prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: addMarkdownStyles(smartContentProcess(moonshotState.generatedHTML))
                    }}
                  />
                </div>
              )}

              {/* 空状态 - 显示默认图片 */}
              {!moonshotState.isGenerating && !moonshotState.isStreaming && !moonshotState.generatedHTML && !moonshotState.error && (
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