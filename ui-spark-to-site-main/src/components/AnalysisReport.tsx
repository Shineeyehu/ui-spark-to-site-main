import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Star, TrendingUp, MapPin, Heart } from 'lucide-react';
import TraditionalPattern from './TraditionalPattern';

interface AnalysisReportProps {
  onBack: () => void;
  formData: any;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ onBack, formData }) => {
  return (
    <section className="min-h-screen bg-gradient-subtle relative py-8">
      <TraditionalPattern />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
          >
            ← 返回首页
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载报告
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Report */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/95 backdrop-blur-sm shadow-warm border border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  命理信息全览与成长指南
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>性别：{formData?.gender === 'female' ? '女' : '男'}</span>
                  <span>出生时间：{formData?.birthDate} {formData?.birthTime}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Core Information */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    命主信息概览
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-primary font-medium">性别：</span>
                      <span className="text-muted-foreground">{formData?.gender === 'female' ? '女' : '男'}</span>
                    </div>
                    <div>
                      <span className="text-primary font-medium">四柱八字：</span>
                      <span className="text-muted-foreground">乙未 丁亥 戊子 乙卯</span>
                    </div>
                    <div>
                      <span className="text-primary font-medium">纳音五行：</span>
                      <span className="text-muted-foreground">沙石金 屋上土 霹雳火</span>
                    </div>
                  </div>
                </div>

                {/* Core Heart Analysis */}
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">一、核心命理分析报告</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">性格根基与数济指南</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          命主天性属和善随顺且富有主观性《象》，又具备上进心很强的朝局能力《无势》，又是明朗义进，
                          文头实条，理杨优长同多向系教育后社会能力，容怀孜坤。
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">潜在天赋深度</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          智学作用：现代电观赁易系类系特色为分，文条迩，适合志学兴制多活能态，配备情操，爱好环境，
                          孔朝境方老手下文，不知这适连瓜速不知时。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Growth Key Points */}
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">成长关键节点</h3>
                  <div className="bg-secondary/30 rounded-lg p-4 border border-secondary">
                    <p className="text-muted-foreground leading-relaxed">
                      当前阶段（26-39岁）：未来人工大明期，直观情红其朝威鸦，成立少人双他刚，末吸选万作门网线—专频。
                      <br /><br />
                      建议关注：人自天气，自成教师万后，培育，阅读，
                      <br />
                      建程方向提升客学能置建议配之能力。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Insights */}
            <Card className="bg-card/95 backdrop-blur-sm shadow-warm border border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  核心洞察
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    性格特质与敏济指南
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    潜在天赋深度
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    兴趣培养与学业方向建议
                  </Badge>
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    成长天赋书
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    智商等级：现代观录赶易系类各特色
                    <br />
                    体质等级：现代电视导赶系各特色分
                    <br />
                    颜青：文条迩，适合
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Environment Factors */}
            <Card className="bg-card/95 backdrop-blur-sm shadow-warm border border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  环境与发展
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground">出生地影响</h4>
                    <p className="text-sm text-muted-foreground">{formData?.birthPlace}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">环境特质</h4>
                    <p className="text-sm text-muted-foreground">{formData?.birthEnvironment}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">发展建议</h4>
                    <p className="text-sm text-muted-foreground">
                      根据地域特色，建议注重文化修养与实践能力的平衡发展
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalysisReport;