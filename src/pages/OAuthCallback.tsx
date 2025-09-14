import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { jwtAuthService } from '@/lib/jwt-auth';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setErrorMessage(`授权失败: ${error}`);
          setStatus('error');
          return;
        }

        if (!code) {
          setErrorMessage('未收到授权码');
          setStatus('error');
          return;
        }

        // 处理 OAuth 回调
        await jwtAuthService.handleOAuthCallback(code, state || '');
        setStatus('success');

        // 3秒后跳转到主页
        setTimeout(() => {
          navigate('/');
        }, 3000);

      } catch (error) {
        // console.error('OAuth callback error:', error);
        setErrorMessage(error instanceof Error ? error.message : '未知错误');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    setStatus('loading');
    setErrorMessage('');
    // 重新开始 OAuth 流程
    jwtAuthService.startOAuthFlow();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="w-6 h-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {status === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
            OAuth 授权
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center space-y-2">
              <p className="text-gray-600">正在处理授权...</p>
              <p className="text-sm text-gray-500">请稍候，我们正在验证您的授权信息</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-green-600">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">授权成功！</p>
                <p className="text-sm text-gray-600">您已成功授权，正在跳转到主页...</p>
              </div>
              <Button onClick={handleGoHome} className="w-full">
                立即跳转
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <XCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">授权失败</p>
                <p className="text-sm text-gray-600">{errorMessage}</p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  重新授权
                </Button>
                <Button onClick={handleGoHome} variant="outline" className="w-full">
                  返回主页
                </Button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
