import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SimpleChat from '@/components/SimpleChat';

const SimpleDeepTalkPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Left Half - Traditional Image */}
      <div className="w-1/2 relative">
        <img
          src="/lovable-uploads/84050b0e-37d1-49be-82ca-b7f81a82e2ae.png"
          alt="Traditional Chinese Wisdom Background"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          style={{ imageRendering: 'auto' }}
        />
      </div>
      
      {/* Right Half - Chat Interface */}
      <div className="w-1/2 relative" style={{ backgroundColor: '#9c5537' }}>
        {/* Back Button */}
        {/* 测试链接 - 生产环境已注释 */}
        {/* <Link
          to="/coze-test"
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-2 z-10"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#8B4513' }} />
          <span style={{ color: '#8B4513' }} className="text-sm">返回测试</span>
        </Link> */}

        <div className="flex items-center justify-center min-h-screen p-6 pt-16">
          <div className="w-full max-w-3xl">
            {/* 深度咨询大标题 */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">深度咨询测试</h1>
            </div>

            {/* Chat Card */}
            <Card className="shadow-xl border-4 rounded-3xl h-[700px] flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#8B4513' }}>
              <CardContent className="p-6 flex-1 flex flex-col" style={{ backgroundColor: '#F8F4E6' }}>
                {/* 简化聊天组件 */}
                <div className="flex-1 flex flex-col min-h-0">
                  <SimpleChat />
                </div>
              </CardContent>
            </Card>

            {/* Footer Info */}
            <div className="text-center mt-4">
              <p style={{ color: '#A0522D' }} className="text-xs">
                简化版深度咨询测试
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDeepTalkPage;
