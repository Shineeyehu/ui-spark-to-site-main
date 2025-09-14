import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import InputBoxTest from '@/components/InputBoxTest';
import CozeV3Chat from '@/components/CozeV3Chat';
import { getCozeConfig } from '@/lib/coze-config';

const InputBoxTestPage: React.FC = () => {
  const cozeConfig = getCozeConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/coze-test">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回测试页面
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">输入框测试</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 基础输入框测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                基础输入框测试
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InputBoxTest />
            </CardContent>
          </Card>

          {/* CozeV3Chat 测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                CozeV3Chat 组件测试
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cozeConfig && cozeConfig.botId ? (
                <div className="h-96">
                  <CozeV3Chat
                    botId={cozeConfig.botId}
                    token={cozeConfig.token}
                    userId={cozeConfig.userId}
                    className="h-full"
                    useJWT={cozeConfig.useJWT}
                    authService={cozeConfig.authService}
                  />
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TestTube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>请先配置扣子智能体参数</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 测试说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>测试说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基础输入框测试</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>测试输入框在发送消息后是否仍然可见</li>
                  <li>测试输入框在加载过程中是否被禁用</li>
                  <li>测试输入框在回复完成后是否重新可用</li>
                  <li>测试输入框的焦点管理</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CozeV3Chat 组件测试</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>测试完整的聊天功能</li>
                  <li>测试 OAuth JWT 认证</li>
                  <li>测试上下文保持</li>
                  <li>测试输入框持续可用性</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">预期结果</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>输入框在对话过程中始终可见</li>
                  <li>输入框在加载时被禁用，完成后重新启用</li>
                  <li>可以连续发送多条消息</li>
                  <li>上下文信息正确保持</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InputBoxTestPage;
