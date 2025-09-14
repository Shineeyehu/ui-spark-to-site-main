import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  User, 
  Calendar, 
  MapPin, 
  Star, 
  TrendingUp, 
  BookOpen,
  Heart,
  Download,
  RefreshCw
} from 'lucide-react';

interface CozeAnalysisResultProps {
  analysisResult: string;
  birthInfo: {
    gender: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    birthEnvironment: string;
  };
  isLoading?: boolean;
  onRetry?: () => void;
  onDownload?: () => void;
}

const CozeAnalysisResult: React.FC<CozeAnalysisResultProps> = ({
  analysisResult,
  birthInfo,
  isLoading = false,
  onRetry,
  onDownload
}) => {
  // 解析分析结果，提取关键信息
  const parseAnalysisResult = (result: string) => {
    const sections = result.split(/\n(?=\d+\.|【|##)/);
    return sections.map(section => section.trim()).filter(section => section.length > 0);
  };

  const analysisSections = parseAnalysisResult(analysisResult);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <CardTitle className="text-2xl font-bold text-amber-800">
              智能命理分析报告
            </CardTitle>
          </div>
          <p className="text-amber-700 text-sm">
            基于传统命理学与现代AI技术的深度分析
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 基本信息概览 */}
          <div className="bg-white/80 rounded-lg p-4 border border-amber-200">
            <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              基本信息概览
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-amber-600">👤</span>
                <span className="text-gray-700">
                  性别：{birthInfo.gender === 'male' ? '男' : '女'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-gray-700">出生：{birthInfo.birthDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600">🕐</span>
                <span className="text-gray-700">时间：{birthInfo.birthTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="text-gray-700 truncate">{birthInfo.birthPlace}</span>
              </div>
            </div>
          </div>

          {/* 分析结果内容 */}
          <div className="bg-white/80 rounded-lg border border-amber-200">
            <div className="p-4 border-b border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                <Star className="w-5 h-5" />
                详细分析结果
              </h3>
            </div>
            
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-amber-600">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>AI 正在分析中...</span>
                    </div>
                  </div>
                ) : (
                  analysisSections.map((section, index) => (
                    <div key={index} className="space-y-2">
                      <div className="prose prose-sm max-w-none">
                        <div 
                          className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ 
                            __html: section.replace(/\n/g, '<br/>') 
                          }}
                        />
                      </div>
                      {index < analysisSections.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新分析
              </Button>
            )}
            {onDownload && (
              <Button
                onClick={onDownload}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                下载报告
              </Button>
            )}
          </div>

          {/* 底部提示 */}
          <div className="text-center text-xs text-amber-600 bg-amber-100/50 rounded-lg p-3">
            <p>
              💡 本分析基于传统命理学理论，结合现代AI技术生成，仅供参考
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CozeAnalysisResult;
