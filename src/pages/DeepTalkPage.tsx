import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCozeConfig, validateCozeConfig } from '@/lib/coze-config';
import CozeV3Chat from '@/components/CozeV3Chat';
import ReauthPrompt from '@/components/ReauthPrompt';

const DeepTalkPage = () => {
  const location = useLocation();
  
  // 显示控制状态
  const [showContent, setShowContent] = useState(false);
  
  // 从路由状态获取上下文信息
  const { formData, analysisContent, moonshotResult, inlineReportHtml } = location.state || {};
  
  // 调试信息
  useEffect(() => {
    // 生产环境已移除调试日志
    // console.log('DeepTalkPage 接收到的路由状态:', {
    //   formData,
    //   analysisContent: analysisContent ? analysisContent.substring(0, 100) + '...' : null,
    //   moonshotResult: moonshotResult ? moonshotResult.substring(0, 100) + '...' : null,
    //   hasFormData: !!formData,
    //   hasAnalysisContent: !!analysisContent,
    //   hasMoonshotResult: !!moonshotResult
    // });
  }, [formData, analysisContent, moonshotResult]);
  
  // 扣子 SDK 相关状态
  const [isCozeLoaded, setIsCozeLoaded] = useState(false);
  const [cozeError, setCozeError] = useState<string | null>(null);
  const cozeClientRef = useRef<any>(null);
  
  // 获取扣子配置 - 现在异步获取
  const [cozeConfig, setCozeConfig] = useState<any>(null);
  const [configStatus, setConfigStatus] = useState<any>({ isValid: false, missingFields: [] });
  const [needsReauth, setNeedsReauth] = useState(false);

  // 立即显示内容，移除延迟
  useEffect(() => {
    setShowContent(true);
  }, []);

  // 直接获取配置（使用同步函数避免Supabase Edge Function覆盖）
  useEffect(() => {
    try {
      const config = getCozeConfig();
      setCozeConfig(config);
      const status = validateCozeConfig(config);
      setConfigStatus(status);
      // console.log('使用同步配置:', config);
    } catch (error) {
      console.error('获取配置失败:', error);
      setCozeError('获取配置失败');
    }
  }, []);


  // 检查扣子 SDK 是否加载
  useEffect(() => {
    const checkSDK = () => {
      if (window.CozeWebSDK) {
        setIsCozeLoaded(true);
        setCozeError(null);
      } else {
        setCozeError('扣子 SDK 未加载，请检查网络连接');
      }
    };

    checkSDK();

    if (!window.CozeWebSDK) {
      const interval = setInterval(() => {
        if (window.CozeWebSDK) {
          setIsCozeLoaded(true);
          setCozeError(null);
          clearInterval(interval);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        if (!window.CozeWebSDK) {
          setCozeError('扣子 SDK 加载超时');
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  // 检查配置状态
  useEffect(() => {
    if (cozeConfig) {
      // console.log('配置状态:', configStatus);
      // console.log('配置信息:', cozeConfig);
      
      if (!configStatus.isValid) {
        console.error('配置不完整:', configStatus.missingFields);
        setCozeError(`配置不完整: ${configStatus.missingFields.join(', ')}`);
      } else {
        // console.log('配置验证通过，可以开始聊天');
        // console.log('当前认证方式:', cozeConfig.useJWT ? 'JWT OAuth' : 'API Key');
        setCozeError(null);
        
        // 检查是否需要重新授权（仅JWT模式）
        if (cozeConfig.useJWT && cozeConfig.authService) {
          const authStatus = cozeConfig.authService.getAuthStatus();
          setNeedsReauth(authStatus.needsReauth);
          // console.log('JWT授权状态:', authStatus);
        } else {
          setNeedsReauth(false); // API Key模式不需要授权
        }
      }
    }
  }, [cozeConfig, configStatus]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (cozeClientRef.current) {
        cozeClientRef.current.destroy();
      }
    };
  }, []);


  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Left Half - Traditional Image */}
      <div className="w-1/2 relative">
        <img
          src="/lovable-uploads/84050b0e-37d1-49be-82ca-b7f81a82e2ae.png"
          alt="Traditional Chinese Wisdom Background"
          className="w-full h-full object-cover"
          loading="eager"
          style={{ imageRendering: 'auto' }}
        />
      </div>
      
      {/* Right Half - Chat Interface */}
      <div className="w-1/2 relative" style={{ backgroundColor: '#9c5537' }}>
        {/* Back Button */}
        <Link
          to="/report"
          state={{
            formData: formData,
            analysisContent: analysisContent,
            moonshotResult: moonshotResult,
            inlineReportHtml: inlineReportHtml,
            fromDeepTalk: true
          }}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-2 z-10"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#8B4513' }} />
          <span style={{ color: '#8B4513' }} className="text-sm">返回报告</span>
        </Link>

        <div className="flex items-center justify-center min-h-screen p-6 pt-16">
          <div className="w-full max-w-3xl">

            {showContent && (
              <>
                {/* 深度咨询大标题 */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2">深度咨询</h1>
                </div>

                {/* Chat Card */}
                <Card className="shadow-xl border-4 rounded-3xl h-[700px] flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#8B4513' }}>
                  <CardContent className="p-6 flex-1 flex flex-col" style={{ backgroundColor: '#F8F4E6' }}>
                    {/* 智能体对话界面 */}
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* 重新授权提示 */}
                      {needsReauth && (
                        <div className="mb-4">
                          <ReauthPrompt
                            onReauthSuccess={() => {
                              setNeedsReauth(false);
                              // 重新检查配置
                              const config = getCozeConfig();
                              setCozeConfig(config);
                              const status = validateCozeConfig(config);
                              setConfigStatus(status);
                            }}
                            onReauthError={(error) => {
                              console.error('重新授权失败:', error);
                            }}
                          />
                        </div>
                      )}
                      
                      {/* 扣子V3 API聊天组件 */}
                      {cozeConfig && configStatus.isValid ? (
                        <CozeV3Chat
                          botId={cozeConfig.botId}
                          token={cozeConfig.token}
                          userId={cozeConfig.userId}
                          className="flex-1 flex flex-col min-h-0"
                          formData={formData}
                          analysisContent={analysisContent}
                          moonshotResult={moonshotResult}
                          inlineReportHtml={inlineReportHtml}
                          useJWT={cozeConfig.useJWT}
                          authService={cozeConfig.authService}
                          isDeepTalk={true}
                        />
                      ) : (
                        <div 
                          className="flex-1 border-2 border-amber-300 rounded-2xl bg-white flex items-center justify-center"
                        >
                          <div className="text-center text-gray-500">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                            <p className="text-sm">正在加载AI服务...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepTalkPage;