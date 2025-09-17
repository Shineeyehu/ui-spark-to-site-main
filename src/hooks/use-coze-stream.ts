import { useState, useCallback, useRef, useEffect } from 'react';
import { CozeAPI, CozeConfig, CozeStreamResponse, BirthInfo } from '@/lib/coze-api';
import { getCozeConfig, validateCozeConfig } from '@/lib/coze-config';

export interface StreamState {
  isStreaming: boolean;
  error: Error | null;
  messages: CozeStreamResponse[];
  streamContent: string;
  conversationId: string | null;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  retryCount: number;
  lastEventTime: number | null;
}

export interface UseCozeStreamOptions {
  onMessage?: (data: CozeStreamResponse) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onConnectionStatusChange?: (status: StreamState['connectionStatus']) => void;
  autoStart?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  config?: Partial<CozeConfig>;
}

export interface UseCozeStreamReturn {
  isStreaming: boolean;
  error: Error | null;
  messages: CozeStreamResponse[];
  streamContent: string;
  conversationId: string | null;
  connectionStatus: StreamState['connectionStatus'];
  retryCount: number;
  startStream: (message: string, conversationId?: string) => Promise<void>;
  startBirthAnalysis: (birthInfo: BirthInfo) => Promise<void>;
  stopStream: () => void;
  clearMessages: () => void;
  retryLastRequest: () => Promise<void>;
  resetConnection: () => void;
}

export const useCozeStream = (options: UseCozeStreamOptions = {}): UseCozeStreamReturn => {
  // 状态管理
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    error: null,
    messages: [],
    streamContent: '',
    conversationId: null,
    connectionStatus: 'idle',
    retryCount: 0,
    lastEventTime: null
  });

  // 引用管理
  const apiRef = useRef<CozeAPI | null>(null);
  const streamRef = useRef<ReadableStream<CozeStreamResponse> | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<CozeStreamResponse> | null>(null);
  const lastRequestRef = useRef<{ type: 'message' | 'birth'; data: any; conversationId?: string } | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 配置选项
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 2000;

  // 更新连接状态
  const updateConnectionStatus = useCallback((status: StreamState['connectionStatus']) => {
    setState(prev => ({ ...prev, connectionStatus: status }));
    options.onConnectionStatusChange?.(status);
  }, [options]);

  // 初始化API
  const initializeAPI = useCallback(async (): Promise<CozeAPI> => {
    if (apiRef.current) {
      return apiRef.current;
    }

    try {
      updateConnectionStatus('connecting');
      
      // 获取配置并验证
      const config = { ...getCozeConfig(), ...options.config };
      const validation = validateCozeConfig(config);
      
      if (!validation.isValid) {
        throw new Error(`配置验证失败: ${validation.missingFields.join(', ')}`);
      }

      console.log('初始化CozeAPI，配置:', {
        botId: config.botId,
        userId: config.userId,
        apiVersion: config.apiVersion,
        streamEnabled: config.streamEnabled
      });

      const api = new CozeAPI(config);
      apiRef.current = api;
      
      updateConnectionStatus('connected');
      return api;
    } catch (error) {
      console.error('API初始化失败:', error);
      updateConnectionStatus('error');
      throw error;
    }
  }, [options.config, updateConnectionStatus]);

  // 处理流式消息
  const handleStreamMessage = useCallback((data: CozeStreamResponse) => {
    console.log('收到流式消息:', data);
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, data],
      streamContent: prev.streamContent + (data.content || ''),
      conversationId: data.conversation_id || prev.conversationId,
      lastEventTime: Date.now(),
      retryCount: 0 // 重置重试计数
    }));

    options.onMessage?.(data);
  }, [options]);

  // 处理错误
  const handleError = useCallback((error: Error) => {
    console.error('流式处理错误:', error);
    
    setState(prev => ({
      ...prev,
      error,
      isStreaming: false,
      retryCount: prev.retryCount + 1
    }));
    
    updateConnectionStatus('error');
    options.onError?.(error);
  }, [options, updateConnectionStatus]);

  // 处理完成
  const handleComplete = useCallback(() => {
    console.log('流式处理完成');
    
    setState(prev => ({
      ...prev,
      isStreaming: false,
      retryCount: 0
    }));
    
    updateConnectionStatus('idle');
    options.onComplete?.();
  }, [options, updateConnectionStatus]);

  // 清理资源
  const cleanup = useCallback(() => {
    if (readerRef.current) {
      try {
        readerRef.current.cancel();
      } catch (e) {
        console.warn('取消reader失败:', e);
      }
      readerRef.current = null;
    }
    
    streamRef.current = null;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // 开始流式聊天
  const startStream = useCallback(async (message: string, targetConversationId?: string) => {
    try {
      console.log('开始流式聊天:', { message, targetConversationId });
      
      // 清理之前的连接
      cleanup();
      
      setState(prev => ({
        ...prev,
        isStreaming: true,
        error: null,
        streamContent: '',
        lastEventTime: Date.now()
      }));
      
      // 记录请求信息用于重试
      lastRequestRef.current = { 
        type: 'message', 
        data: message, 
        conversationId: targetConversationId 
      };
      
      const api = await initializeAPI();
      
      const stream = await api.streamChat(
        message,
        targetConversationId || state.conversationId || undefined,
        handleStreamMessage,
        handleError,
        handleComplete
      );
      
      if (!stream) {
        throw new Error('无法创建流式连接');
      }
      
      streamRef.current = stream;
      const reader = stream.getReader();
      readerRef.current = reader;
      
      // 开始读取流
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('流式读取完成');
            break;
          }
          // 消息已在handleStreamMessage中处理
        }
      } catch (readError) {
        if (readError instanceof Error && readError.name !== 'AbortError') {
          console.error('读取流数据失败:', readError);
          handleError(readError);
        }
      } finally {
        cleanup();
      }
      
    } catch (error) {
      console.error('启动流式聊天失败:', error);
      handleError(error as Error);
    }
  }, [state.conversationId, initializeAPI, handleStreamMessage, handleError, handleComplete, cleanup]);

  // 开始生日分析
  const startBirthAnalysis = useCallback(async (birthInfo: BirthInfo) => {
    try {
      console.log('开始生日分析流式处理:', birthInfo);
      
      // 清理之前的连接
      cleanup();
      
      setState(prev => ({
        ...prev,
        isStreaming: true,
        error: null,
        streamContent: '',
        lastEventTime: Date.now()
      }));
      
      // 记录请求信息用于重试
      lastRequestRef.current = { type: 'birth', data: birthInfo };
      
      const api = await initializeAPI();
      
      const stream = await api.streamBirthAnalysis(
        birthInfo,
        handleStreamMessage,
        handleError,
        handleComplete
      );
      
      if (!stream) {
        throw new Error('无法创建生日分析流式连接');
      }
      
      streamRef.current = stream;
      const reader = stream.getReader();
      readerRef.current = reader;
      
      // 开始读取流
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('生日分析流式读取完成');
            break;
          }
          // 消息已在handleStreamMessage中处理
        }
      } catch (readError) {
        if (readError instanceof Error && readError.name !== 'AbortError') {
          console.error('读取生日分析流数据失败:', readError);
          handleError(readError);
        }
      } finally {
        cleanup();
      }
      
    } catch (error) {
      console.error('启动生日分析流式处理失败:', error);
      handleError(error as Error);
    }
  }, [initializeAPI, handleStreamMessage, handleError, handleComplete, cleanup]);

  // 停止流式处理
  const stopStream = useCallback(() => {
    console.log('停止流式处理');
    cleanup();
    setState(prev => ({
      ...prev,
      isStreaming: false
    }));
    updateConnectionStatus('idle');
  }, [cleanup, updateConnectionStatus]);

  // 清除消息
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      streamContent: '',
      error: null
    }));
  }, []);

  // 重试最后一次请求
  const retryLastRequest = useCallback(async () => {
    if (!lastRequestRef.current) {
      console.warn('没有可重试的请求');
      return;
    }

    if (state.retryCount >= maxRetries) {
      console.warn('已达到最大重试次数');
      return;
    }

    console.log(`重试请求 (${state.retryCount + 1}/${maxRetries}):`, lastRequestRef.current);

    // 延迟重试
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(async () => {
      const request = lastRequestRef.current;
      if (!request) return;

      try {
        if (request.type === 'message') {
          await startStream(request.data, request.conversationId);
        } else if (request.type === 'birth') {
          await startBirthAnalysis(request.data);
        }
      } catch (error) {
        console.error('重试失败:', error);
        handleError(error as Error);
      }
    }, retryDelay);
  }, [state.retryCount, maxRetries, retryDelay, startStream, startBirthAnalysis, handleError]);

  // 重置连接
  const resetConnection = useCallback(() => {
    console.log('重置连接');
    cleanup();
    apiRef.current = null;
    setState(prev => ({
      ...prev,
      isStreaming: false,
      error: null,
      connectionStatus: 'idle',
      retryCount: 0
    }));
  }, [cleanup]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isStreaming: state.isStreaming,
    error: state.error,
    messages: state.messages,
    streamContent: state.streamContent,
    conversationId: state.conversationId,
    connectionStatus: state.connectionStatus,
    retryCount: state.retryCount,
    startStream,
    startBirthAnalysis,
    stopStream,
    clearMessages,
    retryLastRequest,
    resetConnection
  };
};
