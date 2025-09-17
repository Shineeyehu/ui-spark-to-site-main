import React, { useEffect } from 'react';
import { useCozeWorkflow } from '@/hooks/use-coze-workflow';
import { BirthInfo } from '@/lib/coze-api';

interface ReportImageDisplayProps {
  birthInfo: BirthInfo;
  onBack?: () => void;
}

export default function ReportImageDisplay({ birthInfo, onBack }: ReportImageDisplayProps) {
  const {
    workflowState,
    generateReportImage,
    resetWorkflow,
    retryGeneration
  } = useCozeWorkflow();

  // 组件挂载时自动开始生成
  useEffect(() => {
    if (birthInfo) {
      console.log('开始生成报告，生日信息:', birthInfo);
      generateReportImage(birthInfo);
    }
  }, [birthInfo, generateReportImage]);

  // 处理重试
  const handleRetry = () => {
    console.log('用户点击重试');
    retryGeneration();
  };

  // 处理返回
  const handleBack = () => {
    console.log('用户点击返回');
    resetWorkflow();
    onBack?.();
  };

  // 渲染加载状态
  if (workflowState.isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">正在生成命理分析</h2>
            <p className="text-gray-600">{workflowState.currentStep}</p>
          </div>
          
          {/* 进度条 */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${workflowState.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{workflowState.progress}%</p>
          </div>

          {/* 原始流数据预览（调试用） */}
          {workflowState.rawStreamData && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-left max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-1">实时数据流:</p>
              <p className="text-xs text-gray-700 font-mono">
                {workflowState.rawStreamData.substring(0, 200)}
                {workflowState.rawStreamData.length > 200 && '...'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (workflowState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">生成失败</h2>
            <p className="text-gray-600 mb-4">{workflowState.error}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              重试生成
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              返回重新填写
            </button>
          </div>

          {/* 调试信息 */}
          {workflowState.rawStreamData && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer">查看调试信息</summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                  {workflowState.rawStreamData}
                </p>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // 渲染成功状态
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">命理分析报告</h1>
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              返回
            </button>
          </div>
        </div>

        {/* 报告内容 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {workflowState.reportImageUrl ? (
            <div className="text-center">
              <img 
                src={workflowState.reportImageUrl} 
                alt="命理分析报告" 
                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
              />
            </div>
          ) : workflowState.analysisData ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">分析结果</h2>
              
              {/* 渲染分析数据 */}
              {workflowState.analysisData.sections ? (
                <div className="space-y-4">
                  {Object.entries(workflowState.analysisData.sections).map(([title, content]) => (
                    <div key={title} className="border-l-4 border-purple-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: workflowState.analysisData.content || workflowState.rawStreamData 
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">分析完成</h3>
              <p className="text-gray-600 mb-4">但未能生成完整的报告内容</p>
              
              {workflowState.rawStreamData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-500 mb-2">原始分析数据:</p>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {workflowState.rawStreamData}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleRetry}
                className="mt-4 bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
              >
                重新生成
              </button>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleRetry}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            重新生成
          </button>
          <button
            onClick={handleBack}
            className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            返回修改
          </button>
        </div>
      </div>
    </div>
  );
}
