import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  return <div className="w-full h-screen relative overflow-hidden" style={{
    aspectRatio: isMobile ? '9/16' : '16/9'
  }}>
      {/* Background Image - Optimized for Hot Loading */}
      <img 
        src="/lovable-uploads/b16fee50-31f2-4ace-b526-da4abdf3bf40.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        style={{ imageRendering: 'auto' }}
      />
      
      <div className={`relative z-10 flex items-end justify-center h-full ${isMobile ? 'px-4 pb-[15%]' : 'px-4 pb-[25%]'}`}>
        <div className={`text-center ${isMobile ? 'max-w-sm' : 'max-w-4xl'} mx-auto`}>
          {/* Action Buttons positioned over the background */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/birthday">
              <Button 
                size="lg" 
                className={`bg-primary/90 hover:bg-primary text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20 active:shadow-lg rounded-3xl ${
                  isMobile 
                    ? 'px-6 py-4 text-lg font-bold mx-2 my-2' 
                    : 'px-10 py-[26px] text-2xl font-extrabold mx-[10px] my-[10px]'
                }`}
              >
                点击立即挖掘孩子天赋
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;