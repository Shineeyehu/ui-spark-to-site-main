import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, TestTube, RefreshCw } from 'lucide-react';
import { getCozeConfig } from '@/lib/coze-config';
import { jwtAuthService } from '@/lib/jwt-auth';
import { defaultMoonshotConfig } from '@/lib/moonshot-api';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  timestamp: Date;
}

const APITestTool: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testMessage, setTestMessage] = useState('你好，请介绍一下你自己');

  const addTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      name,
      status,
      message,
      details,
      timestamp: new Date()
    }]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // 1. 测试 Coze 配置
    await testCozeConfig();
    
    // 2. 测试 JWT 认证
    await testJWTAuth();
    
    // 3. 测试 Moonshot 配置
    await testMoonshotConfig();
    
    // 4. 测试 Coze API 调用
    await testCozeAPICall();
    
    // 5. 测试 Moonshot API 调用
    await testMoonshotAPICall();

    setIsRunning(false);
  };

  const testCozeConfig = async () => {
    try {
      const config = getCozeConfig();
      
      if (!config.botId) {
        addTestResult('Coze 配置', 'error', 'Bot ID 未配置');
        return;
      }
      
      if (!config.token && !config.useJWT) {
        addTestResult('Coze 配置', 'error', 'Token 未配置且未启用 JWT');
        return;
      }
      
      if (config.token && !config.token.startsWith('pat_')) {
        addTestResult('Coze 配置', 'warning', 'Token 格式可能不正确，应以 pat_ 开头');
        return;
      }
      
      addTestResult('Coze 配置', 'success', '配置验证通过', {
        botId: config.botId,
        hasToken: !!config.token,
        useJWT: config.useJWT,
        hasAuthService: !!config.authService
      });
    } catch (error) {
      addTestResult('Coze 配置', 'error', `配置获取失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const testJWTAuth = async () => {
    try {
      const authStatus = jwtAuthService.getAuthStatus();
      
      if (!authStatus.isAuthenticated) {
        addTestResult('JWT 认证', 'warning', '未进行 OAuth 授权');
        return;
      }
      
      if (authStatus.needsReauth) {
        addTestResult('JWT 认证', 'warning', '需要重新授权');
        return;
      }
      
      try {
        await jwtAuthService.getValidToken();
        addTestResult('JWT 认证', 'success', 'JWT 认证正常', {
          isAuthenticated: authStatus.isAuthenticated,
          hasRefreshToken: authStatus.hasRefreshToken,
          tokenExpiry: authStatus.tokenExpiry
        });
      } catch (error) {
        addTestResult('JWT 认证', 'error', `JWT Token 获取失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    } catch (error) {
      addTestResult('JWT 认证', 'error', `JWT 认证测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const testMoonshotConfig = async () => {
    try {
      if (!defaultMoonshotConfig.apiKey) {
        addTestResult('Moonshot 配置', 'error', 'API Key 未配置');
        return;
      }
      
      if (!defaultMoonshotConfig.model) {
        addTestResult('Moonshot 配置', 'error', 'Model 未配置');
        return;
      }
      
      addTestResult('Moonshot 配置', 'success', '配置验证通过', {
        hasApiKey: !!defaultMoonshotConfig.apiKey,
        model: defaultMoonshotConfig.model,
        baseUrl: defaultMoonshotConfig.baseUrl
      });
    } catch (error) {
      addTestResult('Moonshot 配置', 'error', `配置验证失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const testCozeAPICall = async () => {
    try {
      const config = getCozeConfig();
      
      if (!config.botId) {
        addTestResult('Coze API 调用', 'error', 'Bot ID 未配置，无法测试');
        return;
      }
      
      // 这里可以添加实际的 API 调用测试
      addTestResult('Coze API 调用', 'warning', 'API 调用测试需要有效的 Token 或 JWT 认证');
    } catch (error) {
      addTestResult('Coze API 调用', 'error', `API 调用测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const testMoonshotAPICall = async () => {
    try {
      if (!defaultMoonshotConfig.apiKey) {
        addTestResult('Moonshot API 调用', 'error', 'API Key 未配置，无法测试');
        return;
      }
      
      // 这里可以添加实际的 API 调用测试
      addTestResult('Moonshot API 调用', 'warning', 'API 调用测试需要网络连接');
    } catch (error) {
      addTestResult('Moonshot API 调用', 'error', `API 调用测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'pending':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            API 测试工具
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 测试控制 */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">测试消息</label>
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="输入测试消息..."
              />
            </div>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              {isRunning ? '测试中...' : '运行测试'}
            </Button>
            <Button
              onClick={clearResults}
              variant="outline"
              disabled={isRunning}
            >
              清除结果
            </Button>
          </div>

          {/* 测试统计 */}
          {testResults.length > 0 && (
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

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
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
                          {result.timestamp.toLocaleTimeString()}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer hover:text-gray-600">
                            查看详情
                          </summary>
                          <pre className="mt-2 p-2 bg-white/50 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
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

export default APITestTool;
