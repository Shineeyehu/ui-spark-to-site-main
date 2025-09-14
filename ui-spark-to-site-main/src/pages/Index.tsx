import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
const Index = () => {
  return <div className="w-full h-screen relative overflow-hidden" style={{
    aspectRatio: '16/9'
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
      
      <div className="relative z-10 flex items-end justify-center h-full px-4 pb-[25%]">
        <div className="text-center max-w-4xl mx-auto">
          {/* Action Buttons positioned over the background */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/birthday">
              <Button size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 px-10 backdrop-blur-sm border border-white/20 active:shadow-lg rounded-3xl py-[26px] mx-[10px] my-[10px] text-center text-2xl font-extrabold">
                点击立即挖掘孩子天赋
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;