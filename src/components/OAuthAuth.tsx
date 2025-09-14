import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { jwtAuthService } from '@/lib/jwt-auth';

interface OAuthAuthProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

const OAuthAuth: React.FC<OAuthAuthProps> = ({ onAuthSuccess, onAuthError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkTokenStatus();
  }, []);

  const checkTokenStatus = () => {
    const info = jwtAuthService.getTokenInfo();
    setTokenInfo(info);
  };

  const handleStartAuth = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      jwtAuthService.startOAuthFlow();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '授权启动失败';
      setError(errorMessage);
      onAuthError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await jwtAuthService.getValidToken();
      checkTokenStatus();
      onAuthSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '令牌刷新失败';
      setError(errorMessage);
      onAuthError?.(errorMessage);
      
      // 如果是令牌过期错误，清除本地存储的令牌
      if (errorMessage.includes('expired') || errorMessage.includes('refresh failed')) {
        jwtAuthService.clearTokens();
        checkTokenStatus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTokens = () => {
    jwtAuthService.clearTokens();
    checkTokenStatus();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '未知';
    return date.toLocaleString('zh-CN');
  };

  const getStatusBadge = () => {
    if (!tokenInfo) {
      return <Badge variant="secondary">检查中...</Badge>;
    }
    if (!tokenInfo.hasToken) {
      return <Badge variant="destructive">未授权</Badge>;
    }
    if (tokenInfo.isExpired) {
      return <Badge variant="destructive">已过期</Badge>;
    }
    if (jwtAuthService.isTokenExpiringSoon(5)) {
      return <Badge variant="secondary">即将过期</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">有效</Badge>;
  };

  const getStatusIcon = () => {
    if (!tokenInfo) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    if (!tokenInfo.hasToken) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (tokenInfo.isExpired) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (jwtAuthService.isTokenExpiringSoon(5)) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          OAuth JWT 授权管理
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 状态显示 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">授权状态</p>
              <p className="text-sm text-gray-600">
                {tokenInfo ? (tokenInfo.hasToken ? '已连接扣子平台' : '未连接扣子平台') : '检查中...'}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* 令牌信息 */}
        {tokenInfo && tokenInfo.hasToken && (
          <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">令牌信息</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>过期时间: {formatDate(tokenInfo.expiresAt)}</p>
              {tokenInfo.payload && (
                <p>用户ID: {tokenInfo.payload.sub || '未知'}</p>
              )}
              <p>权限范围: {tokenInfo.payload?.scope || '未知'}</p>
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {!tokenInfo || !tokenInfo.hasToken ? (
            <Button 
              onClick={handleStartAuth}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  启动授权...
                </div>
              ) : (
                '开始 OAuth 授权'
              )}
            </Button>
          ) : (
            <>
              {tokenInfo && (tokenInfo.isExpired || jwtAuthService.isTokenExpiringSoon(5)) ? (
                <Button 
                  onClick={handleRefreshToken}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      刷新中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      刷新令牌
                    </div>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleRefreshToken}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    刷新令牌
                  </div>
                </Button>
              )}
              
              <Button 
                onClick={handleClearTokens}
                variant="outline"
                className="px-4"
              >
                清除令牌
              </Button>
            </>
          )}
        </div>

        {/* 说明信息 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• OAuth 授权比个人访问令牌更安全，适合生产环境使用</p>
          <p>• 令牌会自动刷新，无需手动管理</p>
          <p>• 授权后即可正常使用扣子智能体功能</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OAuthAuth;
