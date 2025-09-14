import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TestTube, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CozeV3Chat from '@/components/CozeV3Chat';
import { getCozeConfig } from '@/lib/coze-config';

const DeepTalkTestPage: React.FC = () => {
  const [formData, setFormData] = useState({
    gender: 'male',
    calendar: 'solar',
    birthDate: '2020-01-01',
    birthTime: '10:00',
    birthPlace: '北京市',
    birthEnvironment: '城市',
    age: '4'
  });

  const [analysisContent, setAnalysisContent] = useState('');
  const [moonshotResult, setMoonshotResult] = useState('');

  const cozeConfig = getCozeConfig();

  const handleTest = () => {
    // 模拟一些测试数据
    setAnalysisContent(`## 命理分析报告

**基本信息**：
- 性别：${formData.gender === 'male' ? '男' : '女'}
- 出生时间：${formData.calendar === 'solar' ? '公历' : '农历'} ${formData.birthDate} ${formData.birthTime}
- 出生地：${formData.birthPlace}

**性格特质**：
这孩子如精雕细琢的白玉，既有金石的坚韧，又有灵动才情。思维条理分明，审美敏锐。

**成长建议**：
培养思考习惯，发挥技术领域优势，未来适合工业设计、游戏开发等。`);

    setMoonshotResult(`根据命理分析，这个孩子具有以下特点：

1. **核心特质**：如精雕细琢的白玉，既有金石的坚韧，又有灵动才情
2. **天赋优势**：逻辑+创造双天赋，思维条理分明，审美敏锐
3. **成长建议**：培养思考习惯，发挥技术领域优势，未来适合工业设计、游戏开发等

建议从古筝开始学习乐器，既能陶冶情操，又能与命理格局相得益彰。`);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">深度咨询测试</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 测试配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                测试配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">性别</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="age">年龄</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="年龄"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate">出生日期</Label>
                <Input
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  type="date"
                />
              </div>

              <div>
                <Label htmlFor="birthTime">出生时间</Label>
                <Input
                  id="birthTime"
                  value={formData.birthTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                  type="time"
                />
              </div>

              <div>
                <Label htmlFor="birthPlace">出生地</Label>
                <Input
                  id="birthPlace"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                  placeholder="出生地"
                />
              </div>

              <Button onClick={handleTest} className="w-full">
                生成测试数据
              </Button>
            </CardContent>
          </Card>

          {/* 深度咨询测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                深度咨询测试
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cozeConfig && cozeConfig.botId ? (
                <div className="h-[600px]">
                  <CozeV3Chat
                    botId={cozeConfig.botId}
                    token={cozeConfig.token}
                    userId={cozeConfig.userId}
                    className="h-full"
                    formData={formData}
                    analysisContent={analysisContent}
                    moonshotResult={moonshotResult}
                    useJWT={cozeConfig.useJWT}
                    authService={cozeConfig.authService}
                  />
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>请先配置扣子智能体参数</p>
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
                <h4 className="font-medium text-gray-900 mb-2">测试步骤</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>配置测试数据（性别、年龄、出生信息等）</li>
                  <li>点击"生成测试数据"按钮</li>
                  <li>在右侧聊天界面测试对话功能</li>
                  <li>验证 OAuth JWT 认证是否正常工作</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">预期结果</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>聊天界面正常显示</li>
                  <li>可以发送消息并收到回复</li>
                  <li>JWT 认证正常工作</li>
                  <li>上下文信息正确传递</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeepTalkTestPage;
