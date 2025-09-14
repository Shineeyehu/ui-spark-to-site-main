import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCozeConfig, getCozeConfigSecure, validateCozeConfig } from '@/lib/coze-config';
import CozeV3Chat from '@/components/CozeV3Chat';

const DeepTalkPage = () => {
  const location = useLocation();
  
  // 显示控制状态
  const [showContent, setShowContent] = useState(false);
  
  // 从路由状态获取上下文信息
  const { formData, analysisContent, moonshotResult } = location.state || {};
  
  // 扣子 SDK 相关状态
  const [isCozeLoaded, setIsCozeLoaded] = useState(false);
  const [cozeError, setCozeError] = useState<string | null>(null);
  const cozeClientRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // 获取扣子配置 - 现在异步获取
  const [cozeConfig, setCozeConfig] = useState<any>(null);
  const [configStatus, setConfigStatus] = useState<any>({ isValid: false, missingFields: [] });

  // 5秒延迟显示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 异步获取配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getCozeConfigSecure();
        setCozeConfig(config);
        const status = validateCozeConfig(config);
        setConfigStatus(status);
      } catch (error) {
        console.error('获取配置失败:', error);
        setCozeError('获取配置失败');
      }
    };
    
    fetchConfig();
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

  // 初始化扣子客户端
  const initializeCozeClient = () => {
    console.log('开始初始化扣子客户端...');
    console.log('配置状态:', configStatus);
    console.log('配置信息:', cozeConfig);
    
    if (!window.CozeWebSDK) {
      console.error('扣子SDK未加载');
      setCozeError('扣子 SDK 未加载');
      return;
    }

    if (!configStatus.isValid) {
      console.error('配置不完整:', configStatus.missingFields);
      setCozeError(`配置不完整: ${configStatus.missingFields.join(', ')}`);
      return;
    }

    if (!chatContainerRef.current) {
      console.error('聊天容器未准备好');
      setCozeError('聊天容器未准备好');
      return;
    }

    try {
      const config = {
        config: {
          bot_id: cozeConfig?.botId || '7547965462022193162',
        },
        componentProps: {
          title: '玄机子 - 深度咨询',
        },
        auth: {
          type: 'token' as const,
          token: cozeConfig?.token || '',
          onRefreshToken: function () {
            console.log('刷新token');
            return cozeConfig?.token || '';
          }
        }
      };

      console.log('扣子客户端配置:', config);
      cozeClientRef.current = new window.CozeWebSDK.WebChatClient(config);
      console.log('扣子客户端创建成功');

    } catch (err) {
      console.error('初始化扣子客户端失败:', err);
      setCozeError('初始化 AI 服务失败');
    }
  };

  // 初始化智能体对话
  const initializeCozeChat = () => {
    if (!cozeClientRef.current) {
      initializeCozeClient();
    }
  };

  // 自动初始化智能体对话
  useEffect(() => {
    if (isCozeLoaded && configStatus.isValid && !cozeClientRef.current && cozeConfig) {
      console.log('自动初始化智能体对话');
      initializeCozeChat();
    } else if (isCozeLoaded && !configStatus.isValid && cozeConfig) {
      console.error('配置不完整，无法初始化智能体');
      setCozeError(`配置不完整: ${configStatus.missingFields.join(', ')}`);
    }
  }, [isCozeLoaded, configStatus.isValid, cozeConfig]);

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
          decoding="sync"
          fetchPriority="high"
          style={{ imageRendering: 'auto' }}
        />
      </div>
      
      {/* Right Half - Chat Interface */}
      <div className="w-1/2 relative" style={{ backgroundColor: '#9c5537' }}>
        {/* Back Button */}
        <Link
          to="/report"
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
                <Card className="shadow-xl border-4 rounded-3xl overflow-hidden h-[700px] flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#8B4513' }}>
                  <CardContent className="p-6 flex-1 flex flex-col" style={{ backgroundColor: '#F8F4E6' }}>
                    {/* 智能体对话界面 */}
                    <div className="flex-1 flex flex-col">
                      {/* 扣子V3 API聊天组件 */}
                      {cozeConfig && configStatus.isValid ? (
                        <CozeV3Chat
                          botId={cozeConfig.botId}
                          token={cozeConfig.token}
                          userId={cozeConfig.userId}
                          className="flex-1 overflow-hidden"
                          formData={formData}
                          analysisContent={analysisContent}
                          moonshotResult={moonshotResult}
                        />
                      ) : (
                        <div 
                          className="flex-1 border-2 border-amber-300 rounded-2xl overflow-hidden bg-white flex items-center justify-center"
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

                {/* Footer Info */}
                <div className="text-center mt-4">
                  <p style={{ color: '#A0522D' }} className="text-xs">
                    国学智慧 × 扣子AI = 智能命理咨询
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepTalkPage;