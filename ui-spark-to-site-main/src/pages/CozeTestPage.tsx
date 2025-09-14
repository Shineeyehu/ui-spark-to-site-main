import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from 'lucide-react';
import CozeChatWidget from '@/components/CozeChatWidget';
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
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">配置说明：</h4>
                <p className="text-sm text-blue-700">
                  请在项目根目录创建 <code className="bg-blue-100 px-1 rounded">.env.local</code> 文件，
                  并添加相应的环境变量配置。
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
                    <p>请先配置扣子智能体参数</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    配置完成后即可开始测试聊天功能
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 使用说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1. 配置环境变量</h4>
                <p>在项目根目录创建 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件：</p>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-x-auto">
{`VITE_COZE_BOT_ID=your_bot_id_here
VITE_COZE_TOKEN=your_access_token_here
VITE_COZE_USER_ID=user_123
VITE_COZE_NICKNAME=用户`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2. 获取配置信息</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>登录 <a href="https://www.coze.cn" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">扣子平台</a></li>
                  <li>创建或选择智能体，获取 Bot ID</li>
                  <li>在 API 设置中创建个人访问令牌</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">3. 测试功能</h4>
                <p>配置完成后，重启开发服务器，然后在此页面测试聊天功能。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CozeTestPage;
