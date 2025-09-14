import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCozeChat } from '@/hooks/use-coze-chat';
import { defaultCozeConfig } from '@/lib/coze-api';
import { Loader2, Send, AlertCircle } from 'lucide-react';

const CozeTestComponent: React.FC = () => {
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  
  const { 
    isLoading, 
    error, 
    sendMessage, 
    clearError 
  } = useCozeChat();

  const handleTestMessage = async () => {
    if (!testMessage.trim()) return;
    
    clearError();
    const response = await sendMessage(testMessage);
    
    if (response && response.messages && response.messages.length > 0) {
      const lastMessage = response.messages[response.messages.length - 1];
      setTestResult(lastMessage.content);
    } else {
      setTestResult('测试失败：未收到有效响应');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            扣子智能体测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testMessage">测试消息</Label>
            <Input
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="输入测试消息..."
              onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
            />
          </div>
          
          <Button 
            onClick={handleTestMessage}
            disabled={isLoading || !testMessage.trim()}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                发送中...
              </div>
            ) : (
              '发送测试消息'
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {testResult && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">响应结果：</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {testResult}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CozeTestComponent;
