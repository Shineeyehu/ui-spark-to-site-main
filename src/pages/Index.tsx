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
      
      <div className="relative z-10 flex items-center justify-center h-full w-full">
        <div className="text-center w-full max-w-4xl mx-auto px-4">
          {/* Action Buttons positioned over the background */}
          <div className={`flex justify-center ${isMobile ? 'mt-32' : 'mt-40'}`}>
            <Link to="/birthday">
              <Button 
                size="lg" 
                className={`bg-primary/90 hover:bg-primary text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20 active:shadow-lg rounded-3xl ${
                  isMobile 
                    ? 'px-8 py-4 text-lg font-bold w-full max-w-xs' 
                    : 'px-12 py-6 text-2xl font-extrabold'
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