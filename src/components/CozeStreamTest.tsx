import React, { useState } from 'react';
import { useCozeStream } from '@/hooks/use-coze-stream';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Square, RotateCcw, Trash2 } from 'lucide-react';

export const CozeStreamTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const {
    isStreaming,
    error,
    messages,
    streamContent,
    conversationId,
    connectionStatus,
    retryCount,
    startStream,
    stopStream,
    clearMessages,
    retryLastRequest,
    resetConnection
  } = useCozeStream({
    onMessage: (data) => {
      console.log('测试组件收到消息:', data);
      setTestResults(prev => [...prev, `收到消息: ${data.event} - ${data.content || '无内容'}`]);
    },
    onError: (error) => {
      console.error('测试组件收到错误:', error);
      setTestResults(prev => [...prev, `错误: ${error.message}`]);
    },
    onComplete: () => {
      console.log('测试组件流式完成');
      setTestResults(prev => [...prev, '流式处理完成']);
    },
    onConnectionStatusChange: (status) => {
      console.log('连接状态变化:', status);
      setTestResults(prev => [...prev, `连接状态: ${status}`]);
    }
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setTestResults(prev => [...prev, `发送消息: ${message}`]);
    await startStream(message);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'disconnected': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Coze 流式 API 测试
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(connectionStatus)}>
                {connectionStatus}
              </Badge>
              {retryCount > 0 && (
                <Badge variant="outline">
                  重试: {retryCount}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 控制面板 */}
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入测试消息..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isStreaming}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isStreaming || !message.trim()}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              发送
            </Button>
            <Button
              variant="outline"
              onClick={stopStream}
              disabled={!isStreaming}
            >
              <Square className="w-4 h-4" />
              停止
            </Button>
            <Button
              variant="outline"
              onClick={retryLastRequest}
              disabled={isStreaming}
            >
              <RotateCcw className="w-4 h-4" />
              重试
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearMessages();
                setTestResults([]);
              }}
            >
              <Trash2 className="w-4 h-4" />
              清除
            </Button>
            <Button
              variant="outline"
              onClick={resetConnection}
            >
              重置连接
            </Button>
          </div>

          {/* 状态信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">流式状态:</span>
              <span className={`ml-2 ${isStreaming ? 'text-green-600' : 'text-gray-600'}`}>
                {isStreaming ? '进行中' : '空闲'}
              </span>
            </div>
            <div>
              <span className="font-medium">消息数量:</span>
              <span className="ml-2">{messages.length}</span>
            </div>
            <div>
              <span className="font-medium">会话ID:</span>
              <span className="ml-2 text-xs">{conversationId || '无'}</span>
            </div>
            <div>
              <span className="font-medium">内容长度:</span>
              <span className="ml-2">{streamContent.length}</span>
            </div>
          </div>

          {/* 错误显示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-medium">错误:</p>
              <p className="text-red-600 text-sm">{error.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 流式内容显示 */}
      {streamContent && (
        <Card>
          <CardHeader>
            <CardTitle>流式内容</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{streamContent}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 消息列表 */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>消息列表 ({messages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded border text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{msg.event}</span>
                    <Badge variant="outline" className="text-xs">
                      {msg.role}
                    </Badge>
                  </div>
                  {msg.content && (
                    <p className="mt-1 text-gray-700">{msg.content}</p>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    ID: {msg.message_id} | 会话: {msg.conversation_id}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试日志 */}
      <Card>
        <CardHeader>
          <CardTitle>测试日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm text-gray-600 font-mono">
                [{new Date().toLocaleTimeString()}] {result}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};