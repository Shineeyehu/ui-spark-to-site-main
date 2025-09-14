import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface CozeV3ChatProps {
  botId: string;
  token: string;
  userId: string;
  className?: string;
  formData?: any;
  analysisContent?: string;
  moonshotResult?: string;
}

const CozeV3Chat: React.FC<CozeV3ChatProps> = ({ 
  botId, 
  token, 
  userId, 
  className = '',
  formData,
  analysisContent,
  moonshotResult
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化玄机子的图片消息和文案
  useEffect(() => {
    const initialMessages: Message[] = [];
    
    // 如果有上下文信息，显示相关信息
    if (formData || analysisContent || moonshotResult) {
      initialMessages.push({
        id: 'context-info',
        content: '根据您之前的命理分析，我已了解您的基本情况。现在可以进行更深入的咨询交流。',
        role: 'assistant',
        timestamp: new Date()
      });
      
      if (formData) {
        const birthInfo = `基本信息：
- 性别：${formData.gender === 'male' ? '男' : '女'}
- 出生时间：${formData.calendar === 'solar' ? '公历' : '农历'}${formData.birthDate} ${formData.birthTime}
- 出生地：${formData.birthPlace}
- 出生环境：${formData.birthEnvironment}
- 年龄：${formData.age}岁`;
        
        initialMessages.push({
          id: 'birth-info',
          content: birthInfo,
          role: 'assistant',
          timestamp: new Date(Date.now() + 500)
        });
      }
    } else {
      // 默认消息
      initialMessages.push({
        id: 'initial-report',
        content: '/lovable-uploads/d74864a4-bbe4-4868-9053-da5f5ac4fe1b.png',
        role: 'assistant',
        timestamp: new Date()
      });
    }
    
    initialMessages.push({
      id: 'greeting',
      content: '缘主若有其余不解之处，贫道随时为您释疑',
      role: 'assistant',
      timestamp: new Date(Date.now() + 1000)
    });
    
    setMessages(initialMessages);
  }, [formData, analysisContent, moonshotResult]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: '',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 构建上下文信息
      let contextInfo = '';
      if (formData) {
        contextInfo += `用户基本信息：
- 性别：${formData.gender === 'male' ? '男' : '女'}
- 出生时间：${formData.calendar === 'solar' ? '公历' : '农历'}${formData.birthDate} ${formData.birthTime}
- 出生地：${formData.birthPlace}
- 出生环境：${formData.birthEnvironment}
- 年龄：${formData.age}岁

`;
      }
      
      if (analysisContent) {
        contextInfo += `之前的分析内容：${analysisContent}

`;
      }
      
      if (moonshotResult) {
        contextInfo += `命理分析结果：${moonshotResult}

`;
      }

      const response = await fetch('https://api.coze.cn/v3/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: botId,
          user_id: userId,
          stream: true,
          additional_messages: [
            {
              content: contextInfo + `用户当前问题：${inputValue}`,
              content_type: "text",
              role: "user",
              type: "question"
            }
          ],
          parameters: {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6); // 移除 'data: ' 前缀
                if (jsonStr === '[DONE]') {
                  break;
                }
                
                const data = JSON.parse(jsonStr);
                
                // 处理不同类型的事件
                if (data.event === 'conversation.message.delta') {
                  const content = data.data?.delta || '';
                  if (content) {
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.role === 'assistant') {
                        lastMessage.content += content;
                      }
                      return newMessages;
                    });
                  }
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', parseError);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      setError(err instanceof Error ? err.message : '发送消息失败');
      
      // 移除未完成的助手消息
      setMessages(prev => prev.filter(msg => msg.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 聊天消息区域 */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gradient-to-b from-amber-50 to-yellow-50 scroll-smooth overscroll-contain scrollbar-thin scrollbar-track-amber-100 scrollbar-thumb-amber-300 hover:scrollbar-thumb-amber-400"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch' // 移动端平滑滚动
        }}
        tabIndex={0} // 支持键盘导航
        onKeyDown={(e) => {
          // 支持键盘上下滚动
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            chatContainerRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            chatContainerRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
          } else if (e.key === 'Home') {
            e.preventDefault();
            chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (e.key === 'End') {
            e.preventDefault();
            chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
          }
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`w-full rounded-lg px-4 py-6 ${
                message.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-800 shadow-md border border-amber-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mt-0.5 flex-shrink-0 border-2 border-amber-600">
                    <img 
                      src="/lovable-uploads/92e84522-d56e-45c8-a162-f453bc1304d2.png"
                      alt="玄机子"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                 <div className="flex-1">
                   {message.content.includes('/lovable-uploads/') ? (
                     <div className="max-h-48 overflow-y-auto border rounded-lg">
                       <img 
                         src={message.content}
                         alt="命理分析报告"
                         className="w-full"
                       />
                     </div>
                   ) : (
                     <p className="text-sm leading-relaxed whitespace-pre-wrap">
                       {message.content}
                     </p>
                   )}
                   <span className="text-xs opacity-70 mt-1 block">
                     {message.timestamp.toLocaleTimeString()}
                   </span>
                 </div>
                {message.role === 'user' && (
                  <User className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md border border-amber-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-600" />
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span className="text-sm text-gray-600">正在思考中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t border-amber-200 bg-white p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题..."
            className="flex-1 border-amber-300 focus:border-amber-500"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          按 Enter 发送消息，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
};

export default CozeV3Chat;