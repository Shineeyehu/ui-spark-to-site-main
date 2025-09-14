import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, User, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TraditionalPattern from './TraditionalPattern';

interface AnalysisFormProps {
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

interface FormData {
  gender: string;
  calendar: string;
  birthDate: string;
  birthTime: string;
  isLeapMonth: string;
  birthPlace: string;
  birthEnvironment: string;
  palmReading?: string;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    gender: '',
    calendar: '',
    birthDate: '',
    birthTime: '',
    isLeapMonth: '',
    birthPlace: '',
    birthEnvironment: '',
    palmReading: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="min-h-screen bg-gradient-subtle relative py-12">
      <TraditionalPattern />
      
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          ← 返回首页
        </Button>
        
        <Card className="bg-card/95 backdrop-blur-sm shadow-warm border border-border/50">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-primary" />
              孩子信息录入
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              请准确填写孩子的出生信息，我们将为您生成专业的成长分析报告
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gender and Calendar Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground font-medium">性别</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="请选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="male">男</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="calendar" className="text-foreground font-medium flex items-center gap-1">
                    公历/农历
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>请选择您记录的出生日期类型</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select value={formData.calendar} onValueChange={(value) => updateFormData('calendar', value)}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="请选择日历类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solar">公历</SelectItem>
                      <SelectItem value="lunar">农历</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-foreground font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  出生日期
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateFormData('birthDate', e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </div>

              {/* Birth Time */}
              <div className="space-y-2">
                <Label htmlFor="birthTime" className="text-foreground font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  出生时间
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>准确的出生时间对分析结果很重要。如果不确定具体时间，请选择最接近的时间段</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => updateFormData('birthTime', e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </div>

              {/* Leap Month */}
              <div className="space-y-2">
                <Label htmlFor="isLeapMonth" className="text-foreground font-medium">是否为闰月</Label>
                <Select value={formData.isLeapMonth} onValueChange={(value) => updateFormData('isLeapMonth', value)}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">否</SelectItem>
                    <SelectItem value="true">是</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birth Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthPlace" className="text-foreground font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    出生地
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>请填写出生时的具体城市或地区</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="birthPlace"
                    value={formData.birthPlace}
                    onChange={(e) => updateFormData('birthPlace', e.target.value)}
                    placeholder="如：北京"
                    className="bg-input border-border"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthEnvironment" className="text-foreground font-medium flex items-center gap-1">
                    出生环境
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>如：城市、平原、楼房等</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="birthEnvironment"
                    value={formData.birthEnvironment}
                    onChange={(e) => updateFormData('birthEnvironment', e.target.value)}
                    placeholder="城市、平原、楼房"
                    className="bg-input border-border"
                    required
                  />
                </div>
              </div>

              {/* Palm Reading (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="palmReading" className="text-foreground font-medium">手相（可选）</Label>
                <Input
                  id="palmReading"
                  value={formData.palmReading}
                  onChange={(e) => updateFormData('palmReading', e.target.value)}
                  placeholder="如有手相信息可填写"
                  className="bg-input border-border"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all duration-300 hover:scale-105 py-3 text-lg"
              >
                提交分析
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AnalysisForm;