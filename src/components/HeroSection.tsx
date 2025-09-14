import React from 'react';
import { Button } from "@/components/ui/button";
import TraditionalPattern from './TraditionalPattern';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="min-h-screen bg-gradient-hero relative flex items-center justify-center overflow-hidden">
      <TraditionalPattern />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main Logo Circle */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-warm">
            <span className="text-primary-foreground text-3xl font-bold">智伴</span>
          </div>
        </div>
        
        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-wide">
          国学少儿智伴
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-medium">
          AI赋能成长 | 因材施教 | 顺势而为
        </p>
        
        {/* Description */}
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          融合传统国学智慧与现代AI技术，为孩子量身定制个性化成长图谱，
          洞察天赋与性格之本，识得环境与机缘之助，
          助父母真正做到因材施教，顺势而为。
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => onNavigate('form')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all duration-300 hover:scale-105 text-lg px-8 py-3"
          >
            开始智能分析
          </Button>
          <Button 
            onClick={() => onNavigate('chat')}
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 text-lg px-8 py-3"
          >
            智能咨询
          </Button>
        </div>
        
        {/* Features List */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 shadow-warm border border-border/50">
            <h3 className="text-xl font-semibold text-foreground mb-2">个性化成长分析报告</h3>
            <p className="text-muted-foreground">基于传统命理学与现代心理学的深度分析</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 shadow-warm border border-border/50">
            <h3 className="text-xl font-semibold text-foreground mb-2">兴趣培养与学业方向建议</h3>
            <p className="text-muted-foreground">发现孩子的天赋特长，指导发展方向</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 shadow-warm border border-border/50">
            <h3 className="text-xl font-semibold text-foreground mb-2">地域与未来发展配置指引</h3>
            <p className="text-muted-foreground">结合地理环境优化孩子的成长规划</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;