import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { jwtAuthService } from '@/lib/jwt-auth';

interface ReauthPromptProps {
  onReauthSuccess?: () => void;
  onReauthError?: (error: string) => void;
}

const ReauthPrompt: React.FC<ReauthPromptProps> = ({ 
  onReauthSuccess, 
  onReauthError 
}) => {
  const handleReauth = () => {
    try {
      jwtAuthService.startOAuthFlow();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '重新授权失败';
      onReauthError?.(errorMessage);
    }
  };

  const handleRefresh = async () => {
    try {
      await jwtAuthService.getValidToken();
      onReauthSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '刷新失败';
      onReauthError?.(errorMessage);
    }
  };

  const authStatus = jwtAuthService.getAuthStatus();

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900 mb-2">
              认证已过期
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              您的 OAuth 授权已过期，需要重新授权才能继续使用深度咨询功能。
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleReauth}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Shield className="w-4 h-4 mr-1" />
                重新授权
              </Button>
              
              {authStatus.hasRefreshToken && (
                <Button
                  onClick={handleRefresh}
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  尝试刷新
                </Button>
              )}
            </div>
            
            {authStatus.tokenExpiry && (
              <p className="text-xs text-amber-600 mt-2">
                令牌过期时间：{authStatus.tokenExpiry.toLocaleString('zh-CN')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReauthPrompt;
