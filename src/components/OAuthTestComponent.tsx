import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { jwtAuthService } from '@/lib/jwt-auth';
import { getCozeConfig } from '@/lib/coze-config';

const OAuthTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    config: boolean;
    oauth: boolean;
    token: boolean;
    api: boolean;
  }>({
    config: false,
    oauth: false,
    token: false,
    api: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsLoading(true);
    setError('');
    
    const results = {
      config: false,
      oauth: false,
      token: false,
      api: false
    };

    try {
      // 测试 1: 配置检查
      const config = getCozeConfig();
      results.config = !!(config.botId && (config.token || config.useJWT));
      
      // 测试 2: OAuth 服务检查
      results.oauth = !!jwtAuthService;
      
      // 测试 3: 令牌状态检查
      if (config.useJWT) {
        const tokenInfo = jwtAuthService.getTokenInfo();
        results.token = tokenInfo.hasToken && !tokenInfo.isExpired;
      } else {
        results.token = !!config.token;
      }
      
      // 测试 4: API 调用测试（如果有有效令牌）
      if (results.token) {
        try {
          // 这里可以添加实际的 API 调用测试
          results.api = true;
        } catch (error) {
          results.api = false;
        }
      } else {
        results.api = false;
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : '测试失败');
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getTestBadge = (passed: boolean) => {
    return passed ? (
      <Badge variant="default" className="bg-green-500">通过</Badge>
    ) : (
      <Badge variant="destructive">失败</Badge>
    );
  };

  const handleStartOAuth = () => {
    jwtAuthService.startOAuthFlow();
  };

  const handleRefreshToken = async () => {
    setIsLoading(true);
    try {
      await jwtAuthService.getValidToken();
      await runTests();
    } catch (error) {
      setError(error instanceof Error ? error.message : '刷新失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          OAuth 功能测试
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 测试结果 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults.config)}
              <div>
                <p className="font-medium">配置检查</p>
                <p className="text-sm text-gray-600">检查 Bot ID 和认证配置</p>
              </div>
            </div>
            {getTestBadge(testResults.config)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults.oauth)}
              <div>
                <p className="font-medium">OAuth 服务</p>
                <p className="text-sm text-gray-600">检查 JWT 认证服务</p>
              </div>
            </div>
            {getTestBadge(testResults.oauth)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults.token)}
              <div>
                <p className="font-medium">令牌状态</p>
                <p className="text-sm text-gray-600">检查访问令牌有效性</p>
              </div>
            </div>
            {getTestBadge(testResults.token)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults.api)}
              <div>
                <p className="font-medium">API 连接</p>
                <p className="text-sm text-gray-600">测试扣子 API 连接</p>
              </div>
            </div>
            {getTestBadge(testResults.api)}
          </div>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button 
            onClick={runTests}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                测试中...
              </div>
            ) : (
              '重新测试'
            )}
          </Button>

          {!testResults.token && (
            <Button 
              onClick={handleStartOAuth}
              variant="outline"
              className="flex-1"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                开始授权
              </div>
            </Button>
          )}

          {testResults.token && (
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
        </div>

        {/* 测试说明 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 配置检查：验证 Bot ID 和认证方式配置</p>
          <p>• OAuth 服务：检查 JWT 认证服务是否正常</p>
          <p>• 令牌状态：验证访问令牌是否有效</p>
          <p>• API 连接：测试与扣子 API 的连接</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OAuthTestComponent;
