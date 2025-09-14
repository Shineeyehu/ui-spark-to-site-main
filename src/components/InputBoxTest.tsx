import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, TestTube, CheckCircle, XCircle } from 'lucide-react';

const InputBoxTest: React.FC = () => {
  const [messages, setMessages] = useState<Array<{id: string, content: string, timestamp: Date}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{test: string, passed: boolean, time: Date}>>([]);

  const addTestResult = (test: string, passed: boolean) => {
    setTestResults(prev => [...prev, { test, passed, time: new Date() }]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 测试输入框是否仍然可见
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder="请输入测试消息..."]') as HTMLInputElement;
      const isVisible = inputElement && inputElement.offsetParent !== null;
      addTestResult(`输入框可见性测试 (消息: "${userMessage.content}")`, isVisible);
      
      if (isVisible) {
        inputElement.focus();
        addTestResult('输入框焦点测试', document.activeElement === inputElement);
      }
    }, 100);

    // 模拟回复
    setTimeout(() => {
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        content: `收到您的消息："${userMessage.content}"。这是第${messages.length + 1}条回复。`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

      // 再次测试输入框状态
      setTimeout(() => {
        const inputElement = document.querySelector('input[placeholder="请输入测试消息..."]') as HTMLInputElement;
        const isVisible = inputElement && inputElement.offsetParent !== null;
        const isEnabled = inputElement && !inputElement.disabled;
        addTestResult(`回复后输入框可见性测试`, isVisible);
        addTestResult(`回复后输入框可用性测试`, isEnabled);
      }, 100);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearTests = () => {
    setTestResults([]);
    setMessages([]);
  };

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            输入框持续可用性测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 测试统计 */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">通过: {passedTests}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">失败: {totalTests - passedTests}</span>
            </div>
            <div className="text-sm text-gray-600">
              总计: {totalTests}
            </div>
            <Button onClick={clearTests} size="sm" variant="outline">
              清除测试
            </Button>
          </div>

          {/* 聊天区域 */}
          <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">开始发送消息来测试输入框的持续可用性...</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="mb-2">
                  <div className={`p-2 rounded-lg ${
                    message.id.startsWith('user') 
                      ? 'bg-blue-100 ml-8' 
                      : 'bg-white mr-8'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-center text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm mt-2">处理中...</p>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入测试消息..."
                className="flex-1"
                disabled={isLoading}
                autoFocus
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              按 Enter 发送消息，Shift + Enter 换行
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {result.passed ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className={result.passed ? 'text-green-700' : 'text-red-700'}>
                    {result.test}
                  </span>
                  <span className="text-gray-500">
                    {result.time.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InputBoxTest;
