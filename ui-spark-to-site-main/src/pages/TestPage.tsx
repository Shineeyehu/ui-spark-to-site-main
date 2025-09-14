import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TestTube, 
  Bot, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  Copy,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TestPage = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<{
    birthday: 'pending' | 'success' | 'error';
    deeptalk: 'pending' | 'success' | 'error';
  }>({
    birthday: 'pending',
    deeptalk: 'pending'
  });

  // 测试数据
  const [testData, setTestData] = useState({
    gender: 'male',
    calendar: 'solar',
    birthDate: '2005-09-09',
    birthTime: '18:05',
    birthPlace: '北京市朝阳区',
    birthEnvironment: '城市平原，楼房，附近有学校、法院、医院',
    age: '20',
    palmReading: '木形手，智慧线平直，感情线浅淡'
  });

  // 测试生日页面智能体
  const testBirthdayAgent = async () => {
    setTestResults(prev => ({ ...prev, birthday: 'pending' }));
    
    try {
      // 模拟测试 - 检查配置和API可用性
      const response = await fetch('https://api.coze.cn/v3/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer cztei_qE0jsG1wsiUXsDSAS2hiuqx0eqUDFtknxhX8EjG60H6p03aU8xUIENKAl3ylVdQzc',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: '7547965462022193162',
          user_id: 'test_user_' + Date.now(),
          stream: false,
          additional_messages: [
            {
              content: '测试连接',
              content_type: "text",
              role: "user",
              type: "question"
            }
          ],
          parameters: {}
        }),
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, birthday: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, birthday: 'error' }));
      }
    } catch (error) {
      console.error('Birthday agent test failed:', error);
      setTestResults(prev => ({ ...prev, birthday: 'error' }));
    }
  };

  // 测试深度咨询页面智能体
  const testDeeptalkAgent = async () => {
    setTestResults(prev => ({ ...prev, deeptalk: 'pending' }));
    
    try {
      // 模拟测试 - 检查配置和API可用性
      const response = await fetch('https://api.coze.cn/v3/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer cztei_qE0jsG1wsiUXsDSAS2hiuqx0eqUDFtknxhX8EjG60H6p03aU8xUIENKAl3ylVdQzc',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: '7547965462022193162',
          user_id: 'test_user_' + Date.now(),
          stream: false,
          additional_messages: [
            {
              content: '测试深度咨询功能',
              content_type: "text",
              role: "user",
              type: "question"
            }
          ],
          parameters: {}
        }),
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, deeptalk: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, deeptalk: 'error' }));
      }
    } catch (error) {
      console.error('Deeptalk agent test failed:', error);
      setTestResults(prev => ({ ...prev, deeptalk: 'error' }));
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    await testBirthdayAgent();
    await testDeeptalkAgent();
  };

  // 跳转到生日页面并传递测试数据
  const goToBirthdayWithTestData = () => {
    navigate('/birthday', { 
      state: { 
        testData: testData,
        fromTest: true 
      } 
    });
  };

  // 跳转到深度咨询页面并传递测试数据
  const goToDeeptalkWithTestData = () => {
    const mockAnalysisContent = `根据测试数据进行的命理分析：
- 性别：${testData.gender === 'male' ? '男' : '女'}
- 出生时间：${testData.calendar === 'solar' ? '公历' : '农历'}${testData.birthDate} ${testData.birthTime}
- 出生地：${testData.birthPlace}
- 出生环境：${testData.birthEnvironment}
- 年龄：${testData.age}岁
- 手相：${testData.palmReading}`;

    navigate('/deeptalk', { 
      state: { 
        formData: testData,
        analysisContent: mockAnalysisContent,
        moonshotResult: '测试生成的知识卡内容',
        fromTest: true 
      } 
    });
  };

  // 复制测试数据
  const copyTestData = () => {
    navigator.clipboard.writeText(JSON.stringify(testData, null, 2));
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return '待测试';
      case 'success':
        return '测试通过';
      case 'error':
        return '测试失败';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TestTube className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">智能体功能测试页面</h1>
          </div>
          <p className="text-gray-600">测试 /birthday 和 /deeptalk 页面的智能体功能</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="birthday">生日页面测试</TabsTrigger>
            <TabsTrigger value="deeptalk">深度咨询测试</TabsTrigger>
            <TabsTrigger value="integration">集成测试</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 智能体状态卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    智能体状态
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">生日页面智能体</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResults.birthday)}
                      <Badge variant={testResults.birthday === 'success' ? 'default' : testResults.birthday === 'error' ? 'destructive' : 'secondary'}>
                        {getStatusText(testResults.birthday)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">深度咨询智能体</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResults.deeptalk)}
                      <Badge variant={testResults.deeptalk === 'success' ? 'default' : testResults.deeptalk === 'error' ? 'destructive' : 'secondary'}>
                        {getStatusText(testResults.deeptalk)}
                      </Badge>
                    </div>
                  </div>

                  <Button onClick={runAllTests} className="w-full" disabled={testResults.birthday === 'pending' || testResults.deeptalk === 'pending'}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    运行所有测试
                  </Button>
                </CardContent>
              </Card>

              {/* 快速访问卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    快速访问
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/birthday" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      访问生日页面
                    </Button>
                  </Link>
                  
                  <Link to="/deeptalk" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      访问深度咨询页面
                    </Button>
                  </Link>
                  
                  <Link to="/report" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      访问报告页面
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* 配置信息 */}
            <Card>
              <CardHeader>
                <CardTitle>智能体配置信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Bot ID</Label>
                    <p className="text-gray-600">7547965462022193162</p>
                  </div>
                  <div>
                    <Label className="font-medium">API版本</Label>
                    <p className="text-gray-600">Coze API v3</p>
                  </div>
                  <div>
                    <Label className="font-medium">响应模式</Label>
                    <p className="text-gray-600">流式响应 (Stream)</p>
                  </div>
                  <div>
                    <Label className="font-medium">上下文传递</Label>
                    <p className="text-gray-600">支持</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 生日页面测试 */}
          <TabsContent value="birthday" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>生日页面智能体测试</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    测试生日页面的智能体是否能正常接收表单数据并进行流式分析。
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button onClick={testBirthdayAgent} disabled={testResults.birthday === 'pending'}>
                    <TestTube className="w-4 h-4 mr-2" />
                    测试智能体连接
                  </Button>
                  
                  <Button onClick={goToBirthdayWithTestData} variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    使用测试数据访问页面
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">测试数据</h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(testData, null, 2)}
                  </pre>
                  <Button 
                    onClick={copyTestData} 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    复制测试数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 深度咨询测试 */}
          <TabsContent value="deeptalk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>深度咨询智能体测试</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    测试深度咨询页面的智能体是否能正确接收上下文信息并进行对话。
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button onClick={testDeeptalkAgent} disabled={testResults.deeptalk === 'pending'}>
                    <TestTube className="w-4 h-4 mr-2" />
                    测试智能体连接
                  </Button>
                  
                  <Button onClick={goToDeeptalkWithTestData} variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    使用测试数据访问页面
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">上下文数据</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>表单数据:</strong> 包含用户基本信息</p>
                    <p><strong>分析内容:</strong> 模拟的命理分析结果</p>
                    <p><strong>知识卡结果:</strong> 模拟的HTML知识卡内容</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 集成测试 */}
          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>完整流程集成测试</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    测试从生日页面到深度咨询页面的完整流程，验证上下文传递是否正常。
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">填写生日信息</p>
                      <p className="text-sm text-gray-600">在生日页面填写完整的出生信息</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">AI智能分析</p>
                      <p className="text-sm text-gray-600">智能体进行流式命理分析</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">生成知识卡</p>
                      <p className="text-sm text-gray-600">在报告页面生成HTML知识卡</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <p className="font-medium">深度咨询</p>
                      <p className="text-sm text-gray-600">在深度咨询页面进行个性化对话</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={goToBirthdayWithTestData} className="flex-1">
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始完整流程测试
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestPage;

