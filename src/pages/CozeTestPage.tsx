import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Shield, TestTube } from 'lucide-react';
import CozeChatWidget from '@/components/CozeChatWidget';
import OAuthAuth from '@/components/OAuthAuth';
import OAuthTestComponent from '@/components/OAuthTestComponent';
import APITestTool from '@/components/APITestTool';
import OAuthDiagnostic from '@/components/OAuthDiagnostic';
import { CozeStreamTest } from '@/components/CozeStreamTest';
import { getCozeConfig, validateCozeConfig } from '@/lib/coze-config';

const CozeTestPage: React.FC = () => {
  const cozeConfig = getCozeConfig();
  const configStatus = validateCozeConfig(cozeConfig);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/birthday">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回生日页面
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">扣子智能体测试</h1>
        </div>

        {/* OAuth 授权 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              OAuth JWT 授权
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OAuthAuth />
          </CardContent>
        </Card>

        {/* OAuth 功能测试 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              OAuth 功能测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OAuthTestComponent />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 配置信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                配置信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">当前配置状态：</h3>
                <div className={`p-3 rounded-lg ${configStatus.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {configStatus.isValid ? '✅ 配置完整' : '❌ 配置不完整'}
                </div>
              </div>

              {!configStatus.isValid && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">缺少的配置项：</h4>
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {configStatus.missingFields.map(field => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">配置详情：</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Bot ID:</span> 
                    <span className="ml-2 text-gray-600">
                      {cozeConfig.botId || '未配置'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Token:</span> 
                    <span className="ml-2 text-gray-600">
                      {cozeConfig.token ? '已配置' : '未配置'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span> 
                    <span className="ml-2 text-gray-600">{cozeConfig.userId}</span>
                  </div>
                  <div>
                    <span className="font-medium">Nickname:</span> 
                    <span className="ml-2 text-gray-600">{cozeConfig.nickname}</span>
                  </div>
                  <div>
                    <span className="font-medium">JWT 认证:</span> 
                    <span className="ml-2 text-gray-600">
                      {cozeConfig.useJWT ? '已启用' : '未启用'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">配置说明：</h4>
                <p className="text-sm text-blue-700">
                  推荐使用 OAuth JWT 授权方式，比个人访问令牌更安全，适合生产环境使用。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 聊天测试 */}
          <Card>
            <CardHeader>
              <CardTitle>聊天测试</CardTitle>
            </CardHeader>
            <CardContent>
              {configStatus.isValid ? (
                <CozeChatWidget
                  botId={cozeConfig.botId}
                  token={cozeConfig.token}
                  userId={cozeConfig.userId}
                  nickname={cozeConfig.nickname}
                  title="测试助手"
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>请先完成 OAuth 授权或配置扣子智能体参数</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    配置完成后即可开始测试聊天功能
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 快速测试链接 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>快速测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Link to="/deeptalk-test">
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  深度咨询测试
                </Button>
              </Link>
              <Link to="/simple-deeptalk">
                <Button variant="outline" className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  简化版测试
                </Button>
              </Link>
              <Link to="/input-test">
                <Button variant="outline" className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  输入框测试
                </Button>
              </Link>
              <Link to="/deeptalk">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  深度咨询页面
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1. OAuth JWT 授权（推荐）</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>点击"开始 OAuth 授权"按钮</li>
                  <li>在扣子平台完成授权流程</li>
                  <li>系统会自动获取并管理 JWT 令牌</li>
                  <li>令牌会自动刷新，无需手动管理</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2. 传统配置方式（备选）</h4>
                <p>在项目根目录创建 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件：</p>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-x-auto">
{`VITE_COZE_BOT_ID=7546564367413379135
VITE_COZE_API_TOKEN=your_access_token_here
VITE_COZE_USE_JWT=false`}
                </pre>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>登录 <a href="https://www.coze.cn" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">扣子平台</a></li>
                  <li>创建或选择智能体，获取 Bot ID</li>
                  <li>在 API 设置中创建个人访问令牌</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">3. 测试功能</h4>
                <p>完成授权或配置后，即可在此页面测试聊天功能。OAuth 方式更安全，适合生产环境使用。</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ 重要提示</h4>
                <p className="text-yellow-800">
                  个人访问令牌存在安全风险，建议在生产环境中使用 OAuth JWT 授权方式。
                  测试环境可以使用个人访问令牌快速验证功能。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OAuth 诊断工具 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              OAuth 诊断工具
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OAuthDiagnostic />
          </CardContent>
        </Card>

        {/* 流式 API 测试 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              流式 API 测试 (新版本)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CozeStreamTest />
          </CardContent>
        </Card>

        {/* API 测试工具 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              API 测试工具 (旧版本)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <APITestTool />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CozeTestPage;
