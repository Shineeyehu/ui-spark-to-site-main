import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, X, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCozeConfig, validateCozeConfig } from '@/lib/coze-config';
import CozeChatWidget from './CozeChatWidget';
import CozeAnalysisResult from './CozeAnalysisResult';
import CozeStreamChat from './CozeStreamChat';
import { useCozeWorkflow } from '@/hooks/use-coze-workflow';
import { useCozeStream } from '@/hooks/use-coze-stream';
import { defaultWorkflowConfig } from '@/lib/coze-workflow';

interface FormData {
  gender: string;
  calendar: string;
  birthDate: string;
  birthTime: string;
  isLeapMonth?: string;
  birthPlace: string;
  birthEnvironment: string;
  age?: string;
  palmReading?: string;
}

const BirthdayForm = () => {
  const navigate = useNavigate();
  
  // 生成默认出生日期（当前日期往前推20年）
  const getDefaultBirthDate = () => {
    const today = new Date();
    const defaultYear = today.getFullYear() - 20;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${defaultYear}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState<FormData>({
    gender: 'male', // 默认选择男性
    calendar: 'solar', // 默认选择公历
    birthDate: getDefaultBirthDate(), // 默认出生日期
    birthTime: '18:05', // 默认时间
    isLeapMonth: 'false', // 默认非闰月
    birthPlace: '北京市朝阳区', // 默认出生地
    birthEnvironment: '城市、平原、楼房', // 默认出生环境
    age: '20', // 默认年龄
    palmReading: ''
  });

  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState({ hours: '18', minutes: '05' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 扣子智能体相关状态
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [showCozeChat, setShowCozeChat] = useState(false);
  const [showStreamChat, setShowStreamChat] = useState(false);
  
  // 工作流相关状态
  const { 
    isLoading: isWorkflowLoading, 
    error: workflowError, 
    imageUrl, 
    generateReportImage, 
    clearError: clearWorkflowError 
  } = useCozeWorkflow(defaultWorkflowConfig);
  
  // 流式响应相关状态
  const {
    streamState,
    startBirthAnalysis,
    stopStream,
    clearMessages
  } = useCozeStream();
  
  // 获取扣子配置
  const cozeConfig = getCozeConfig();
  const configStatus = validateCozeConfig(cozeConfig);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 生成分析内容
  const generateAnalysisContent = () => {
    const { gender, calendar, birthDate, birthTime, isLeapMonth, birthPlace, birthEnvironment } = formData;
    
    return `请为以下命理信息生成一张精美的命理分析图片：

基本信息：
- 性别：${gender}
- 历法：${calendar}
- 出生日期：${birthDate}
- 出生时间：${birthTime}
- 是否闰月：${isLeapMonth}
- 出生地：${birthPlace}
- 出生环境：${birthEnvironment}

请生成一张包含命理分析、五行属性、性格特点等内容的精美图片，风格要传统典雅，适合命理分析报告使用。`;
  };

  // 检查表单是否完整填写
  const isFormComplete = () => {
    return formData.gender && 
           formData.calendar && 
           formData.birthDate && 
           formData.birthTime && 
           formData.isLeapMonth && 
           formData.birthPlace && 
           formData.birthEnvironment &&
           formData.age;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.gender) newErrors.gender = '请选择性别';
    if (!formData.calendar) newErrors.calendar = '请选择公历或农历';
    if (!formData.birthDate) newErrors.birthDate = '请选择出生日期';
    if (!formData.birthTime) newErrors.birthTime = '请选择出生时间';
    if (!formData.isLeapMonth) newErrors.isLeapMonth = '请选择是否为闰月';
    if (!formData.birthPlace) newErrors.birthPlace = '请填写出生地';
    if (!formData.birthEnvironment) newErrors.birthEnvironment = '请填写出生环境';
    if (!formData.age) newErrors.age = '请填写年龄';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // 跳转到报告页面，传递表单数据
    navigate('/report', { 
      state: { 
        formData: formData,
        fromBirthday: true // 标记来自生日页面
      } 
    });
  };

  const handleStreamSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // 生成分析内容
    const analysisContent = generateAnalysisContent();
    
    // 跳转到报告页面，传递表单数据和分析内容
    navigate('/report', { 
      state: { 
        formData: formData,
        analysisContent: analysisContent,
        fromBirthday: true // 标记来自生日页面
      } 
    });
  };

  const handleCloseCozeChat = () => {
    setShowCozeChat(false);
  };

  const handleCloseStreamChat = () => {
    setShowStreamChat(false);
    stopStream();
  };

  const handleBackToForm = () => {
    setShowAnalysisResult(false);
    setAnalysisResult('');
  };

  const handleTimeConfirm = () => {
    const timeString = `${tempTime.hours}:${tempTime.minutes}`;
    updateFormData('birthTime', timeString);
    setShowTimePicker(false);
  };

  const handleTimeCancel = () => {
    // Reset temp time to current form value or default
    const currentTime = formData.birthTime || '18:05';
    const [hours, minutes] = currentTime.split(':');
    setTempTime({ hours: hours || '18', minutes: minutes || '05' });
    setShowTimePicker(false);
  };

  const getTooltipContent = (field: string) => {
    const tooltips = {
      calendar: '请选择您记录的出生日期类型',
      birthTime: '真太阳时：指根据当地太阳实际位置确定的时间，日影最短为正午12点，不同经度地方各不相同。\n\n查阅自己当地真太阳时的方法：\n在线工具辅助，搜索"真太阳时计算器"或访问专业天文/时间网站，输入地点或经纬度，可自动换算。',
      birthPlace: '要填写完整省市县，如河北省石家庄市正定县',
      birthEnvironment: '出生地的环境，如"城市，平原，楼房，附近有学校、法院、医院"等'
    };
    return tooltips[field as keyof typeof tooltips] || '';
  };

  // 如果显示流式聊天，渲染流式聊天组件
  if (showStreamChat) {
    return (
      <div className="w-full h-full bg-amber-900 relative overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={handleCloseStreamChat}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-2 z-10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white text-sm">返回表单</span>
        </button>
        
        <div className="pt-16 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">AI 智能命理分析</h2>
              <p className="text-amber-200 text-sm">
                基于您填写的出生信息，AI 正在为您进行深度分析
              </p>
            </div>
            
            <CozeStreamChat
              streamState={streamState}
              onStop={stopStream}
              onClear={clearMessages}
              title="命理分析助手"
              className="bg-white/10 backdrop-blur-sm"
            />
            
            {/* 用户信息提示 */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">您的出生信息：</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-amber-200">
                <div>性别：{formData.gender === 'male' ? '男' : '女'}</div>
                <div>年龄：{formData.age}岁</div>
                <div>出生日期：{formData.birthDate}</div>
                <div>出生时间：{formData.birthTime}</div>
                <div>出生地：{formData.birthPlace}</div>
                <div>出生环境：{formData.birthEnvironment}</div>
              </div>
              <p className="text-xs text-amber-300 mt-2">
                💡 AI 正在根据这些信息为您生成详细的命理分析报告
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果显示扣子聊天，渲染聊天组件
  if (showCozeChat && configStatus.isValid) {
    return (
      <div className="w-full h-full bg-amber-900 relative overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={handleCloseCozeChat}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-2 z-10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white text-sm">返回表单</span>
        </button>
        
        <div className="pt-16 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">AI 智能命理分析</h2>
              <p className="text-amber-200 text-sm">
                基于您填写的出生信息，与 AI 助手进行深度对话分析
              </p>
            </div>
            
            <CozeChatWidget
              botId={cozeConfig.botId}
              token={cozeConfig.token}
              userId={cozeConfig.userId}
              nickname={cozeConfig.nickname}
              title="命理分析助手"
              onClose={handleCloseCozeChat}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            />
            
            {/* 用户信息提示 */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">您的出生信息：</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-amber-200">
                <div>性别：{formData.gender === 'male' ? '男' : '女'}</div>
                <div>出生日期：{formData.birthDate}</div>
                <div>出生时间：{formData.birthTime}</div>
                <div>出生地：{formData.birthPlace}</div>
                <div className="col-span-2">出生环境：{formData.birthEnvironment}</div>
              </div>
              <p className="text-xs text-amber-300 mt-2">
                💡 您可以将这些信息告诉 AI 助手，获得更精准的分析
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-amber-900 relative">
      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
        <span className="text-white text-sm">返回上一页</span>
      </Link>
      
      {/* Test Button */}
      <Link
        to="/coze-test"
        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span className="text-white text-sm">开发者选项</span>
      </Link>
      <Card className="bg-yellow-50 backdrop-blur-sm shadow-xl border-0 rounded-2xl w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          {/* Gender and Calendar Type - First Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gray-600 font-normal text-sm">性别</Label>
              <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                <SelectTrigger className={`bg-gray-50 border-gray-200 rounded-lg h-10 text-gray-700 font-normal ${errors.gender ? 'border-red-400' : ''}`}>
                  <SelectValue placeholder="女" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="male">男</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>
            
            <div className="space-y-1">
              <Label className="text-gray-600 font-normal text-sm flex items-center gap-1">
                公历/农历
                <TooltipProvider>
                  <Tooltip open={showTooltip === 'calendar'}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onMouseEnter={() => setShowTooltip('calendar')}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => setShowTooltip(showTooltip === 'calendar' ? null : 'calendar')}
                      >
                        <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-amber-100 border border-amber-200 shadow-lg rounded-lg z-50 text-amber-900">
                      <p className="whitespace-pre-line text-amber-800">{getTooltipContent('calendar')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select value={formData.calendar} onValueChange={(value) => updateFormData('calendar', value)}>
                <SelectTrigger className={`bg-gray-50 border-gray-200 rounded-lg h-10 text-gray-700 font-normal ${errors.calendar ? 'border-red-400' : ''}`}>
                  <SelectValue placeholder="solar" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                  <SelectItem value="solar">solar(公历)</SelectItem>
                  <SelectItem value="lunar">lunar(农历)</SelectItem>
                </SelectContent>
              </Select>
              {errors.calendar && <p className="text-red-500 text-xs mt-1">{errors.calendar}</p>}
            </div>
          </div>

          {/* Birth Date - Second Row */}
          <div className="space-y-1">
            <Label className="text-gray-600 font-normal text-sm">出生日期</Label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateFormData('birthDate', e.target.value)}
              className={`w-full bg-gray-50 border-gray-200 rounded-lg h-10 text-gray-700 font-normal text-center ${errors.birthDate ? 'border-red-400' : ''}`}
              placeholder="2024-01-01"
            />
            {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
          </div>

          {/* Birth Time - Third Row */}
          <div className="space-y-1">
            <Label className="text-gray-600 font-normal text-sm flex items-center gap-1">
              出生时间
              <TooltipProvider>
                <Tooltip open={showTooltip === 'birthTime'}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onMouseEnter={() => setShowTooltip('birthTime')}
                      onMouseLeave={() => setShowTooltip(null)}
                      onClick={() => setShowTooltip(showTooltip === 'birthTime' ? null : 'birthTime')}
                    >
                      <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-amber-100 border border-amber-200 shadow-lg rounded-lg z-50 text-amber-900">
                    <p className="whitespace-pre-line text-amber-800">{getTooltipContent('birthTime')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Popover open={showTimePicker} onOpenChange={setShowTimePicker}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg h-10 text-gray-700 font-normal hover:bg-gray-100 transition-colors flex items-center justify-center ${errors.birthTime ? 'border-red-400' : ''}`}
                >
                  {formData.birthTime || '18:05'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                <div className="p-4 space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">选择时间</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">小时</Label>
                      <Select value={tempTime.hours} onValueChange={(value) => setTempTime(prev => ({ ...prev, hours: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-32 overflow-y-auto">
                          {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(hour => (
                            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">分钟</Label>
                      <Select value={tempTime.minutes} onValueChange={(value) => setTempTime(prev => ({ ...prev, minutes: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-32 overflow-y-auto">
                          {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(minute => (
                            <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleTimeCancel}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      取消
                    </Button>
                    <Button 
                      onClick={handleTimeConfirm}
                      size="sm"
                      className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
                    >
                      确认
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {errors.birthTime && <p className="text-red-500 text-xs mt-1">{errors.birthTime}</p>}
          </div>

          {/* Leap Month - Fourth Row */}
          <div className="space-y-1">
            <Label className="text-gray-600 font-normal text-sm">是否为闰月</Label>
            <Select value={formData.isLeapMonth} onValueChange={(value) => updateFormData('isLeapMonth', value)}>
              <SelectTrigger className={`bg-gray-50 border-gray-200 rounded-lg h-10 text-gray-700 font-normal ${errors.isLeapMonth ? 'border-red-400' : ''}`}>
                <SelectValue placeholder="false" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                <SelectItem value="false">否</SelectItem>
                <SelectItem value="true">是</SelectItem>
              </SelectContent>
            </Select>
            {errors.isLeapMonth && <p className="text-red-500 text-xs mt-1">{errors.isLeapMonth}</p>}
          </div>

          {/* Birth Location - Fifth Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gray-600 font-normal text-sm flex items-center gap-1">
                出生地
                <TooltipProvider>
                  <Tooltip open={showTooltip === 'birthPlace'}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onMouseEnter={() => setShowTooltip('birthPlace')}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => setShowTooltip(showTooltip === 'birthPlace' ? null : 'birthPlace')}
                      >
                        <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-amber-100 border border-amber-200 shadow-lg rounded-lg z-50 text-amber-900">
                      <p className="whitespace-pre-line text-amber-800">{getTooltipContent('birthPlace')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                value={formData.birthPlace}
                onChange={(e) => updateFormData('birthPlace', e.target.value)}
                placeholder="河北省石家庄市正定县"
                className={`bg-gray-50 border-gray-200 rounded-lg h-10 text-gray-700 font-normal ${errors.birthPlace ? 'border-red-400' : ''}`}
              />
              {errors.birthPlace && <p className="text-red-500 text-xs mt-1">{errors.birthPlace}</p>}
            </div>
            
            <div className="space-y-1">
              <Label className="text-gray-600 font-normal text-sm flex items-center gap-1">
                出生环境
                <TooltipProvider>
                  <Tooltip open={showTooltip === 'birthEnvironment'}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onMouseEnter={() => setShowTooltip('birthEnvironment')}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => setShowTooltip(showTooltip === 'birthEnvironment' ? null : 'birthEnvironment')}
                      >
                        <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-amber-100 border border-amber-200 shadow-lg rounded-lg z-50 text-amber-900">
                      <p className="whitespace-pre-line text-amber-800">{getTooltipContent('birthEnvironment')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                value={formData.birthEnvironment}
                onChange={(e) => updateFormData('birthEnvironment', e.target.value)}
                placeholder="城市、平原、楼房"
                className={`bg-gray-50 border-gray-200 rounded-lg h-10 text-gray-700 font-normal ${errors.birthEnvironment ? 'border-red-400' : ''}`}
              />
              {errors.birthEnvironment && <p className="text-red-500 text-xs mt-1">{errors.birthEnvironment}</p>}
            </div>
          </div>

          {/* Age - Sixth Row */}
          <div className="space-y-1">
            <Label className="text-gray-600 font-normal text-sm">年龄</Label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) => updateFormData('age', e.target.value)}
              placeholder="20"
              min="1"
              max="120"
              className={`w-full bg-gray-50 border-gray-200 rounded-lg h-10 text-gray-700 font-normal text-center ${errors.age ? 'border-red-400' : ''}`}
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>

          {/* Palm Reading - Seventh Row */}
          <div className="space-y-1">
            <Label className="text-gray-600 font-normal text-sm">手相</Label>
            {/* File Upload Section */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updateFormData('palmReading', file.name);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`bg-gray-50 border border-gray-200 rounded-lg h-10 flex items-center justify-center text-gray-700 font-normal hover:bg-gray-100 transition-colors`}>
                {formData.palmReading ? (
                  <span className="text-xs text-gray-600 truncate px-2">{formData.palmReading}</span>
                ) : (
                  <span>点击上传手相图片</span>
                )}
              </div>
            </div>
          </div>

          {/* AI 智能体提示 */}
          <div className="pt-2">
          </div>

          {/* Submit Button - Bottom */}
          <div className="pt-3">
            <Button 
              onClick={handleSubmit}
              disabled={!isFormComplete()}
              className={`w-full rounded-2xl h-11 text-base font-medium shadow-md transition-all duration-200 border-2 ${
                isFormComplete() 
                  ? 'bg-amber-700 hover:bg-amber-800 hover:shadow-lg text-amber-100 border-amber-600' 
                  : 'bg-gray-300 hover:bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {streamState.isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始 AI 命理分析
                </>
              )}
            </Button>
          </div>

          {/* 错误信息显示 */}
          {errors.submit && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
              {errors.submit}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BirthdayForm;