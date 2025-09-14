import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageCircle, Bot } from 'lucide-react';
import TraditionalPattern from './TraditionalPattern';

interface ChatInterfaceProps {
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是智能少儿智伴助手。我可以为您解答关于孩子成长、教育、性格分析等相关问题。请告诉我您想了解什么？',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "根据您的问题，我建议关注孩子的天赋特长发展。每个孩子都有独特的成长轨迹，需要因材施教。",
      "从传统国学的角度来看，孩子的性格培养需要结合其天生的特质。建议您观察孩子在不同环境下的表现。",
      "教育孩子需要顺势而为。我可以为您分析孩子的性格特点，制定个性化的培养方案。您需要填写孩子的基本信息吗？",
      "孩子的成长环境对其发展很重要。结合地域特色和文化背景，可以更好地规划孩子的未来发展方向。",
      "感谢您的信任。如果您想要更详细的分析报告，建议填写完整的出生信息，我可以为您生成专业的成长指导建议。"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="min-h-screen bg-gradient-subtle relative">
      <TraditionalPattern />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          ← 返回首页
        </Button>
        
        <Card className="bg-card/95 backdrop-blur-sm shadow-warm border border-border/50 h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              智能咨询助手
            </CardTitle>
            <p className="text-muted-foreground">
              专业的国学少儿成长咨询，随时为您解答疑问
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-background/50 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-secondary text-secondary-foreground mr-4'
                    }`}
                  >
                    {!message.isUser && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs font-medium">智能助手</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入您的问题..."
                className="flex-1 bg-input border-border"
              />
              <Button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick Questions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue('如何培养孩子的兴趣爱好？')}
                className="text-xs"
              >
                如何培养孩子的兴趣爱好？
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue('孩子性格内向怎么办？')}
                className="text-xs"
              >
                孩子性格内向怎么办？
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue('什么时候开始规划孩子的未来？')}
                className="text-xs"
              >
                什么时候开始规划孩子的未来？
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ChatInterface;