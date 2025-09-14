import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Sparkles, Loader2 } from 'lucide-react';

interface CozeChatWidgetProps {
  botId: string;
  token: string;
  userId?: string;
  nickname?: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const CozeChatWidget: React.FC<CozeChatWidgetProps> = ({
  botId,
  token,
  userId = 'user',
  nickname = 'User',
  title = 'AI 智能助手',
  onClose,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const cozeClientRef = useRef<any>(null);

  // 检查扣子 SDK 是否加载
  useEffect(() => {
    const checkSDK = () => {
      console.log('检查扣子SDK:', window.CozeWebSDK);
      console.log('SDK版本信息:', window.CozeWebSDK?.version);
      
      if (window.CozeWebSDK && window.CozeWebSDK.WebChatClient) {
        setIsLoaded(true);
        setError(null);
        console.log('扣子SDK加载成功，版本:', window.CozeWebSDK.version || '未知');
      } else {
        console.log('扣子SDK未加载');
        setError('扣子 SDK 未加载，请检查网络连接');
      }
    };

    // 立即检查
    checkSDK();

    // 如果未加载，设置定时检查
    if (!window.CozeWebSDK) {
      const interval = setInterval(() => {
        if (window.CozeWebSDK && window.CozeWebSDK.WebChatClient) {
          setIsLoaded(true);
          setError(null);
          console.log('扣子SDK延迟加载成功，版本:', window.CozeWebSDK.version || '未知');
          clearInterval(interval);
        }
      }, 1000);

      // 15秒后停止检查
      setTimeout(() => {
        clearInterval(interval);
        if (!window.CozeWebSDK) {
          console.error('扣子SDK加载超时');
          setError('扣子 SDK 加载超时，请刷新页面重试');
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, []);

  // 初始化扣子客户端
  const initializeCozeClient = () => {
    console.log('开始初始化扣子客户端...');
    console.log('SDK状态:', window.CozeWebSDK);
    console.log('容器状态:', chatContainerRef.current);
    console.log('配置参数:', { botId, token, userId, nickname });

    if (!window.CozeWebSDK) {
      console.error('扣子SDK未加载');
      setError('扣子 SDK 未加载');
      return;
    }

    if (!window.CozeWebSDK.WebChatClient) {
      console.error('扣子SDK WebChatClient 不可用');
      setError('扣子 SDK WebChatClient 不可用');
      return;
    }

    if (!chatContainerRef.current) {
      console.error('聊天容器未准备好');
      setError('聊天容器未准备好');
      return;
    }

    try {
      const config = {
        config: {
          type: 'bot' as const,
          bot_id: botId,
          isIframe: false,
        },
        auth: {
          type: 'token' as const,
          token: token,
          onRefreshToken: async () => {
            console.log('刷新token');
            return token;
          }
        },
        userInfo: {
          id: userId,
          url: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/coze-logo.png',
          nickname: nickname,
        },
        ui: {
          base: {
            icon: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/chatsdk-logo.png',
            layout: 'pc' as const,
            lang: 'zh-CN' as const,
            zIndex: 1000
          },
          header: {
            isShow: true,
            isNeedClose: true,
          },
          asstBtn: {
            isNeed: false // 我们使用自定义按钮
          },
          footer: {
            isShow: true,
            expressionText: 'Powered by 扣子 AI',
          },
          chatBot: {
            title: title,
            uploadable: true,
            width: 400,
            el: chatContainerRef.current,
          },
        },
      };

      console.log('扣子客户端配置:', config);
      cozeClientRef.current = new window.CozeWebSDK.WebChatClient(config);
      console.log('扣子客户端创建成功');

      // 新版本SDK可能不需要手动监听事件
      // 事件处理由SDK内部管理

    } catch (err: any) {
      console.error('初始化扣子客户端失败:', err);
      setError(`初始化聊天服务失败: ${err.message || '未知错误'}`);
    }
  };

  // 打开聊天窗口
  const handleOpenChat = () => {
    if (!cozeClientRef.current) {
      initializeCozeClient();
    }
    
    if (cozeClientRef.current && typeof cozeClientRef.current.open === 'function') {
      cozeClientRef.current.open();
      setIsOpen(true);
    } else {
      // 如果open方法不存在，直接设置为打开状态
      setIsOpen(true);
    }
  };

  // 关闭聊天窗口
  const handleCloseChat = () => {
    if (cozeClientRef.current && typeof cozeClientRef.current.close === 'function') {
      cozeClientRef.current.close();
    }
    setIsOpen(false);
    onClose?.();
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (cozeClientRef.current && typeof cozeClientRef.current.destroy === 'function') {
        cozeClientRef.current.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <Card className={`bg-red-50 border-red-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <X className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className={`bg-gray-50 border-gray-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">正在加载 AI 助手...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* 聊天容器 */}
      <div 
        ref={chatContainerRef} 
        className={`${isOpen ? 'block' : 'hidden'} w-full h-96 border border-gray-200 rounded-lg overflow-hidden`}
      />
      
      {/* 控制按钮已移除 */}
      
      {isOpen && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">AI 助手已开启</span>
          <Button
            onClick={handleCloseChat}
            variant="outline"
            size="sm"
          >
            <X className="w-4 h-4 mr-1" />
            关闭
          </Button>
        </div>
      )}
    </div>
  );
};

export default CozeChatWidget;
