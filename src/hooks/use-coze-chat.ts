import { useState, useCallback } from 'react';
import CozeAPI, { CozeResponse, BirthInfo, CozeConfig } from '@/lib/coze-api';

interface UseCozeChatReturn {
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<CozeResponse | null>;
  analyzeBirthInfo: (birthInfo: BirthInfo) => Promise<CozeResponse | null>;
  clearError: () => void;
  resetConversation: () => void;
}

export function useCozeChat(): UseCozeChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // 使用简化的配置
  const [cozeAPI] = useState(() => new CozeAPI({
    botId: 'configured-in-backend',
    userId: 'user_' + Date.now(),
    accessToken: 'configured-in-backend'
  }));

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetConversation = useCallback(() => {
    setConversationId(null);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<CozeResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cozeAPI.sendMessage(message, conversationId || undefined);
      
      // 如果返回了新的 conversation_id，更新状态
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送消息失败';
      setError(errorMessage);
      // console.error('扣子聊天错误:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cozeAPI, conversationId]);

  const analyzeBirthInfo = useCallback(async (birthInfo: BirthInfo): Promise<CozeResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cozeAPI.analyzeBirthInfo(birthInfo);
      
      // 如果返回了新的 conversation_id，更新状态
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分析出生信息失败';
      setError(errorMessage);
      // console.error('扣子分析错误:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cozeAPI, conversationId]);

  return {
    isLoading,
    error,
    conversationId,
    sendMessage,
    analyzeBirthInfo,
    clearError,
    resetConversation
  };
}
