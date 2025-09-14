import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, X, RotateCcw } from 'lucide-react';
import { StreamState } from '@/hooks/use-coze-stream';

interface CozeStreamChatProps {
  streamState: StreamState;
  onStop: () => void;
  onClear: () => void;
  title?: string;
  className?: string;
}

export default function CozeStreamChat({
  streamState,
  onStop,
  onClear,
  title = "AI 智能分析",
  className = ""
}: CozeStreamChatProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [streamState.messages, streamState.currentMessage]);

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-amber-800">
          {title}
        </CardTitle>
        <div className="flex gap-2">
          {streamState.isStreaming && (
            <Button
              onClick={onStop}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              停止
            </Button>
          )}
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            清空
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96 w-full" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {/* 显示历史消息 */}
            {streamState.messages.map((message, index) => (
              <div key={index} className="flex justify-end">
                <div className="max-w-[80%] bg-amber-100 rounded-lg p-3 shadow-sm">
                  <div className="text-sm text-amber-800 whitespace-pre-wrap">
                    {message}
                  </div>
                </div>
              </div>
            ))}
            
            {/* 显示当前流式消息 */}
            {streamState.currentMessage && (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-amber-100 rounded-lg p-3 shadow-sm">
                  <div className="text-sm text-amber-800 whitespace-pre-wrap">
                    {streamState.currentMessage}
                    {streamState.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-amber-600 ml-1 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* 加载状态 */}
            {streamState.isStreaming && !streamState.currentMessage && streamState.messages.length === 0 && (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-2 text-amber-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">AI 正在分析中...</span>
                </div>
              </div>
            )}
            
            {/* 错误状态 */}
            {streamState.error && (
              <div className="flex justify-center">
                <div className="max-w-[80%] bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-600">
                    错误: {streamState.error}
                  </div>
                </div>
              </div>
            )}
            
            {/* 空状态 */}
            {!streamState.isStreaming && streamState.messages.length === 0 && !streamState.error && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center text-gray-500">
                  <div className="text-sm">点击"生成 AI 命理报告"开始分析</div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* 状态栏 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              {streamState.conversationId && (
                <span>会话ID: {streamState.conversationId}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {streamState.isStreaming && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>正在分析...</span>
                </>
              )}
              {!streamState.isStreaming && streamState.messages.length > 0 && (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span>分析完成</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}