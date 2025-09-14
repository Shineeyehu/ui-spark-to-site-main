import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Trash2,
  Settings
} from 'lucide-react';
import { jwtAuthService, defaultOAuthConfig } from '@/lib/jwt-auth';
import { 
  runOAuthFix, 
  generateFixSuggestions, 
  quickFixOAuth,
  clearOAuthData,
  checkOAuthConfig,
  checkRedirectUri,
  checkAuthStatus,
  refreshToken
} from '@/utils/oauth-fix';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  fix?: string;
}

const OAuthDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const status = jwtAuthService.getAuthStatus();
    setAuthStatus(status);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // 使用统一的修复工具
      const fixResults = await runOAuthFix();
      
      // 转换结果格式
      fixResults.forEach((result, index) => {
        const status = result.success ? 'success' : 'error';
        addResult(
          `检查 ${index + 1}`,
          status,
          result.message,
          result.details,
          result.action
        );
      });
      
      // 生成修复建议
      const suggestions = generateFixSuggestions(fixResults);
      if (suggestions.length > 0) {
        addResult(
          '修复建议',
          'warning',
          suggestions.join('\n'),
          null,
          '请按照建议进行修复'
        );
      }
    } catch (error) {
      addResult('诊断运行', 'error', `诊断失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    setIsRunning(false);
  };

  const checkOAuthConfig = async () => {
    try {
      const config = defaultOAuthConfig;
      
      if (!config.clientId) {
        addResult('OAuth 配置', 'error', 'Client ID 未配置', null, '请设置 VITE_COZE_CLIENT_ID 环境变量');
        return;
      }
      
      if (!config.clientSecret) {
        addResult('OAuth 配置', 'error', 'Client Secret 未配置', null, '请设置 VITE_COZE_CLIENT_SECRET 环境变量');
        return;
      }
      
      if (!config.redirectUri) {
        addResult('OAuth 配置', 'error', 'Redirect URI 未配置', null, '请设置 VITE_COZE_REDIRECT_URI 环境变量');
        return;
      }
      
      addResult('OAuth 配置', 'success', 'OAuth 配置完整', {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        authUrl: config.authUrl,
        tokenUrl: config.tokenUrl,
        scope: config.scope
      });
    } catch (error) {
      addResult('OAuth 配置', 'error', `配置检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const checkCurrentAuthStatus = async () => {
    try {
      const status = jwtAuthService.getAuthStatus();
      
      if (!status.isAuthenticated) {
        addResult('认证状态', 'warning', '未进行 OAuth 授权', status, '请点击"开始授权"按钮进行 OAuth 授权');
        return;
      }
      
      if (status.needsReauth) {
        addResult('认证状态', 'warning', '需要重新授权', status, '令牌已过期，请重新进行 OAuth 授权');
        return;
      }
      
      addResult('认证状态', 'success', '认证状态正常', status);
    } catch (error) {
      addResult('认证状态', 'error', `状态检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const checkTokenValidity = async () => {
    try {
      const tokenInfo = jwtAuthService.getTokenInfo();
      
      if (!tokenInfo.hasToken) {
        addResult('令牌有效性', 'warning', '没有有效的访问令牌', tokenInfo, '请进行 OAuth 授权获取令牌');
        return;
      }
      
      if (tokenInfo.isExpired) {
        addResult('令牌有效性', 'error', '访问令牌已过期', tokenInfo, '请重新进行 OAuth 授权');
        return;
      }
      
      if (tokenInfo.expiresAt) {
        const timeLeft = tokenInfo.expiresAt.getTime() - Date.now();
        const minutesLeft = Math.floor(timeLeft / (1000 * 60));
        
        if (minutesLeft < 5) {
          addResult('令牌有效性', 'warning', `令牌即将过期 (${minutesLeft} 分钟)`, tokenInfo, '建议提前刷新令牌');
        } else {
          addResult('令牌有效性', 'success', `令牌有效 (剩余 ${minutesLeft} 分钟)`, tokenInfo);
        }
      } else {
        addResult('令牌有效性', 'success', '令牌有效', tokenInfo);
      }
    } catch (error) {
      addResult('令牌有效性', 'error', `令牌检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const checkRedirectUri = async () => {
    try {
      const config = defaultOAuthConfig;
      const currentOrigin = window.location.origin;
      const expectedRedirectUri = `${currentOrigin}/oauth/callback`;
      
      if (config.redirectUri !== expectedRedirectUri) {
        addResult('重定向 URI', 'warning', '重定向 URI 不匹配', {
          expected: expectedRedirectUri,
          actual: config.redirectUri
        }, '请确保 OAuth 应用配置中的重定向 URI 与当前域名匹配');
        return;
      }
      
      addResult('重定向 URI', 'success', '重定向 URI 配置正确', {
        redirectUri: config.redirectUri,
        currentOrigin: currentOrigin
      });
    } catch (error) {
      addResult('重定向 URI', 'error', `重定向 URI 检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const checkWorkspaceAccess = async () => {
    try {
      // 这里可以添加检查工作空间访问权限的逻辑
      addResult('工作空间访问', 'warning', '无法验证工作空间访问权限', null, '请确保已加入对应的工作空间，或检查 OAuth 应用权限设置');
    } catch (error) {
      addResult('工作空间访问', 'error', `工作空间检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const addResult = (name: string, status: DiagnosticResult['status'], message: string, details?: any, fix?: string) => {
    setResults(prev => [...prev, { name, status, message, details, fix }]);
  };

  const handleStartOAuth = () => {
    try {
      jwtAuthService.startOAuthFlow();
    } catch (error) {
      console.error('启动 OAuth 流程失败:', error);
    }
  };

  const handleRefreshToken = async () => {
    try {
      await jwtAuthService.getValidToken();
      checkAuthStatus();
      addResult('令牌刷新', 'success', '令牌刷新成功');
    } catch (error) {
      addResult('令牌刷新', 'error', `令牌刷新失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleClearTokens = () => {
    jwtAuthService.clearTokens();
    checkAuthStatus();
    addResult('清除令牌', 'success', '已清除所有令牌');
  };

  const handleQuickFix = async () => {
    setIsRunning(true);
    try {
      const result = await quickFixOAuth();
      addResult('一键修复', result.success ? 'success' : 'error', result.message, result.details, result.action);
      checkAuthStatus();
    } catch (error) {
      addResult('一键修复', 'error', `修复失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    setIsRunning(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            OAuth 诊断工具
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 当前状态 */}
          {authStatus && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">当前状态:</span>
                    <Badge variant={authStatus.isAuthenticated ? 'default' : 'destructive'}>
                      {authStatus.isAuthenticated ? '已认证' : '未认证'}
                    </Badge>
                  </div>
                  {authStatus.tokenExpiry && (
                    <div className="text-sm text-gray-600">
                      令牌过期时间: {authStatus.tokenExpiry.toLocaleString('zh-CN')}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={runDiagnostic}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              {isRunning ? '诊断中...' : '运行诊断'}
            </Button>
            
            <Button
              onClick={handleStartOAuth}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              开始授权
            </Button>
            
            <Button
              onClick={handleRefreshToken}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新令牌
            </Button>
            
            <Button
              onClick={handleClearTokens}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              清除令牌
            </Button>
            
            <Button
              onClick={handleQuickFix}
              disabled={isRunning}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4" />
              一键修复
            </Button>
          </div>

          {/* 诊断统计 */}
          {results.length > 0 && (
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">成功: {successCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm">错误: {errorCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">警告: {warningCount}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 诊断结果 */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>诊断结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{result.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{result.message}</p>
                      
                      {result.fix && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <strong>修复建议:</strong> {result.fix}
                        </div>
                      )}
                      
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer hover:text-gray-600 text-sm">
                            查看详情
                          </summary>
                          <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                            <pre className="overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => copyToClipboard(JSON.stringify(result.details, null, 2))}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              复制
                            </Button>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OAuthDiagnostic;
