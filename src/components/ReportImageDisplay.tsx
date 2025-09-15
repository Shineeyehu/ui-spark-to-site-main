import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ReportImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate?: () => void;
  onDownload?: () => void;
  title?: string;
  description?: string;
}

const ReportImageDisplay: React.FC<ReportImageDisplayProps> = ({
  imageUrl,
  isLoading,
  error,
  onRegenerate,
  onDownload,
  title = "命理分析报告图",
  description = "基于传统命理学生成的个性化分析报告"
}) => {
  const [zoomLevel, setZoomLevel] = React.useState(1);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1.0));
  };

  const handleDownload = () => {
    if (imageUrl && onDownload) {
      onDownload();
    } else if (imageUrl) {
      // 默认下载行为
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = '命理分析报告.png';
      link.target = '_blank';
      link.click();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* 控制按钮 */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {onRegenerate && (
                <Button
                  onClick={onRegenerate}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  重新生成
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleZoomOut}
                variant="outline"
                size="sm"
                disabled={!imageUrl || zoomLevel <= 1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleZoomIn}
                variant="outline"
                size="sm"
                disabled={!imageUrl || zoomLevel >= 2}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                disabled={!imageUrl}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载
              </Button>
            </div>
          </div>

          {/* 图片显示区域 */}
          <div className="relative bg-gray-50 rounded-lg min-h-[400px] flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600">正在生成报告图片...</p>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center gap-3 text-red-500">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm text-center max-w-md">{error}</p>
                {onRegenerate && (
                  <Button
                    onClick={onRegenerate}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    重试
                  </Button>
                )}
              </div>
            )}
            
            {imageUrl && !isLoading && !error && (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={title}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                  onError={() => console.error('图片加载失败')}
                />
              </div>
            )}
            
            {!imageUrl && !isLoading && !error && (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <ImageIcon className="w-12 h-12" />
                <p className="text-sm">暂无报告图片</p>
              </div>
            )}
          </div>
          
          {/* 状态信息 */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex gap-2">
              <Badge variant="secondary">AI生成</Badge>
              {imageUrl && <Badge variant="outline">可下载</Badge>}
            </div>
            {zoomLevel !== 1 && (
              <span>缩放: {Math.round(zoomLevel * 100)}%</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportImageDisplay;
