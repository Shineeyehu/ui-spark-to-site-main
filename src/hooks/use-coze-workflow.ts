import React, { useState, useCallback, useRef } from 'react';
import { useCozeStream } from './use-coze-stream';
import { CozeMixedDataExtractor } from '@/lib/coze-mixed-data-extractor';
import { BirthInfo, CozeStreamResponse } from '@/lib/coze-api';

export interface WorkflowState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  reportImageUrl: string | null;
  analysisData: any | null;
  rawStreamData: string;
}

export interface UseCozeWorkflowReturn {
  workflowState: WorkflowState;
  generateReportImage: (birthInfo: BirthInfo) => Promise<void>;
  resetWorkflow: () => void;
  retryGeneration: () => void;
}

export const useCozeWorkflow = (): UseCozeWorkflowReturn => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    error: null,
    reportImageUrl: null,
    analysisData: null,
    rawStreamData: ''
  });

  const lastBirthInfoRef = useRef<BirthInfo | null>(null);
  const dataExtractor = useRef(new CozeMixedDataExtractor());

  // 使用新的流式hooks
  const {
    isStreaming,
    error: streamError,
    messages,
    streamContent,
    startBirthAnalysis,
    stopStream,
    clearMessages,
    retryLastRequest
  } = useCozeStream();

  // 处理流式消息的回调
  const handleStreamMessage = useCallback((response: CozeStreamResponse) => {
    console.log('工作流收到流式消息:', response);
    
    // 更新原始流数据
    setWorkflowState(prev => ({
      ...prev,
      rawStreamData: prev.rawStreamData + JSON.stringify(response) + '\n'
    }));

    // 使用数据提取器处理消息
    if (response.content) {
      const extractedData = dataExtractor.current.extractMixedData(response.content);
      
      if (extractedData) {
        console.log('提取到的数据:', extractedData);
        
        // 更新分析数据
        setWorkflowState(prev => ({
          ...prev,
          analysisData: extractedData,
          progress: Math.min(prev.progress + 10, 90) // 逐步增加进度
        }));

        // 如果提取到图片URL，设置为报告图片
        if (extractedData.imageUrl) {
          setWorkflowState(prev => ({
            ...prev,
            reportImageUrl: extractedData.imageUrl,
            progress: 100,
            currentStep: '报告生成完成',
            isGenerating: false
          }));
        }
      }
    }

    // 处理不同类型的事件
    switch (response.event) {
      case 'conversation.message.delta':
        setWorkflowState(prev => ({
          ...prev,
          currentStep: '正在分析生辰信息...',
          progress: Math.min(prev.progress + 5, 80)
        }));
        break;
      case 'conversation.message.completed':
        setWorkflowState(prev => ({
          ...prev,
          currentStep: '分析完成，正在生成报告...',
          progress: 90
        }));
        break;
      case 'done':
        if (!workflowState.reportImageUrl) {
          // 如果没有图片URL，尝试从累积的内容中生成
          const imageUrl = generateImageFromAnalysis(workflowState.analysisData);
          setWorkflowState(prev => ({
            ...prev,
            reportImageUrl: imageUrl,
            progress: 100,
            currentStep: imageUrl ? '报告生成完成' : '报告生成失败',
            isGenerating: false
          }));
        }
        break;
    }
  }, [workflowState.analysisData, workflowState.reportImageUrl]);

  // 处理错误的回调
  const handleStreamError = useCallback((error: string) => {
    console.error('工作流流式错误:', error);
    setWorkflowState(prev => ({
      ...prev,
      error,
      isGenerating: false,
      currentStep: '生成失败'
    }));
  }, []);

  // 生成报告图片
  const generateReportImage = useCallback(async (birthInfo: BirthInfo) => {
    console.log('开始生成报告图片:', birthInfo);
    
    // 重置状态
    setWorkflowState({
      isGenerating: true,
      progress: 0,
      currentStep: '正在连接AI智能体...',
      error: null,
      reportImageUrl: null,
      analysisData: null,
      rawStreamData: ''
    });

    // 保存当前的生辰信息用于重试
    lastBirthInfoRef.current = birthInfo;

    // 重置数据提取器
    dataExtractor.current = new CozeMixedDataExtractor();

    try {
      // 开始流式分析
      await startBirthAnalysis(birthInfo, {
        onMessage: handleStreamMessage,
        onError: handleStreamError,
        onComplete: () => {
          console.log('流式分析完成');
          setWorkflowState(prev => ({
            ...prev,
            isGenerating: false,
            currentStep: prev.reportImageUrl ? '报告生成完成' : '正在处理结果...'
          }));
        }
      });

      setWorkflowState(prev => ({
        ...prev,
        progress: 20,
        currentStep: '已连接，开始分析...'
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成报告失败';
      console.error('生成报告图片错误:', error);
      setWorkflowState(prev => ({
        ...prev,
        error: errorMessage,
        isGenerating: false,
        currentStep: '生成失败'
      }));
    }
  }, [startBirthAnalysis, handleStreamMessage, handleStreamError]);

  // 重置工作流
  const resetWorkflow = useCallback(() => {
    console.log('重置工作流状态');
    setWorkflowState({
      isGenerating: false,
      progress: 0,
      currentStep: '',
      error: null,
      reportImageUrl: null,
      analysisData: null,
      rawStreamData: ''
    });
    clearMessages();
    stopStream();
    lastBirthInfoRef.current = null;
    dataExtractor.current = new CozeMixedDataExtractor();
  }, [clearMessages, stopStream]);

  // 重试生成
  const retryGeneration = useCallback(async () => {
    if (lastBirthInfoRef.current) {
      console.log('重试生成报告图片');
      await generateReportImage(lastBirthInfoRef.current);
    } else {
      console.warn('没有保存的生辰信息，无法重试');
    }
  }, [generateReportImage]);

  // 同步流式错误到工作流状态
  React.useEffect(() => {
    if (streamError) {
      setWorkflowState(prev => ({
        ...prev,
        error: streamError,
        isGenerating: false,
        currentStep: '连接失败'
      }));
    }
  }, [streamError]);

  return {
    workflowState,
    generateReportImage,
    resetWorkflow,
    retryGeneration
  };
};

// 辅助函数：从分析数据生成图片URL
function generateImageFromAnalysis(analysisData: any): string | null {
  if (!analysisData) return null;
  
  // 尝试从不同字段中提取图片URL
  const possibleImageFields = [
    'imageUrl',
    'image_url', 
    'reportImage',
    'report_image',
    'pictureUrl',
    'picture_url'
  ];
  
  for (const field of possibleImageFields) {
    if (analysisData[field] && typeof analysisData[field] === 'string') {
      return analysisData[field];
    }
  }
  
  // 如果没有找到图片URL，返回null
  return null;
}
