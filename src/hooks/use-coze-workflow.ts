import { useState, useCallback } from 'react';
import { CozeWorkflowService, WorkflowRunParams, WorkflowConfig } from '@/lib/coze-workflow';

interface UseCozeWorkflowReturn {
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
  generateReportImage: (analysisContent: string) => Promise<string | null>;
  clearError: () => void;
  reset: () => void;
}

export function useCozeWorkflow(config: WorkflowConfig): UseCozeWorkflowReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [workflowService] = useState(() => new CozeWorkflowService(config));

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setImageUrl(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const generateReportImage = useCallback(async (analysisContent: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = await workflowService.generateReportImage(analysisContent);
      setImageUrl(url);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成报告图片失败';
      setError(errorMessage);
      console.error('扣子工作流错误:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workflowService]);

  return {
    isLoading,
    error,
    imageUrl,
    generateReportImage,
    clearError,
    reset
  };
}
