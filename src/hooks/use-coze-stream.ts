import { useState, useCallback, useRef } from 'react';
import CozeAPI, { CozeStreamResponse, BirthInfo, defaultCozeConfig } from '@/lib/coze-api';

export interface StreamState {
  isStreaming: boolean;
  messages: string[];
  currentMessage: string;
  conversationId?: string;
  error?: string;
}

export interface UseCozeStreamReturn {
  streamState: StreamState;
  startStream: (message: string) => Promise<void>;
  startBirthAnalysis: (birthInfo: BirthInfo) => Promise<void>;
  stopStream: () => void;
  clearMessages: () => void;
}

export function useCozeStream(): UseCozeStreamReturn {
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    messages: [],
    currentMessage: '',
    conversationId: undefined,
    error: undefined
  });

  const streamRef = useRef<ReadableStream<CozeStreamResponse> | null>(null);
  const cozeAPI = useRef(new CozeAPI(defaultCozeConfig));

  const startStream = useCallback(async (message: string) => {
    if (streamState.isStreaming) {
      return;
    }

    setStreamState(prev => ({
      ...prev,
      isStreaming: true,
      currentMessage: '',
      error: undefined
    }));

    try {
      const stream = await cozeAPI.current.streamChat(
        message,
        streamState.conversationId,
        (data: CozeStreamResponse) => {
          setStreamState(prev => {
            let newCurrentMessage = prev.currentMessage;
            let newMessages = [...prev.messages];
            let newConversationId = prev.conversationId;

            // 更新会话ID
            if (data.conversation_id) {
              newConversationId = data.conversation_id;
            }

            // 处理消息内容
            if (data.content && data.role === 'assistant') {
              if (data.event === 'conversation.message.delta') {
                // 流式更新当前消息
                newCurrentMessage += data.content;
              } else if (data.event === 'conversation.message.completed') {
                // 消息完成，添加到消息列表
                newMessages.push(prev.currentMessage + data.content);
                newCurrentMessage = '';
              }
            }

            return {
              ...prev,
              currentMessage: newCurrentMessage,
              messages: newMessages,
              conversationId: newConversationId
            };
          });
        },
        (error: Error) => {
          setStreamState(prev => ({
            ...prev,
            isStreaming: false,
            error: error.message
          }));
        },
        () => {
          setStreamState(prev => ({
            ...prev,
            isStreaming: false
          }));
        }
      );

      streamRef.current = stream;
    } catch (error) {
      setStreamState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : '未知错误'
      }));
    }
  }, [streamState.isStreaming, streamState.conversationId]);

  const startBirthAnalysis = useCallback(async (birthInfo: BirthInfo) => {
    if (streamState.isStreaming) {
      return;
    }

    setStreamState(prev => ({
      ...prev,
      isStreaming: true,
      currentMessage: '',
      error: undefined
    }));

    try {
      const stream = await cozeAPI.current.streamBirthAnalysis(
        birthInfo,
        (data: CozeStreamResponse) => {
          setStreamState(prev => {
            let newCurrentMessage = prev.currentMessage;
            let newMessages = [...prev.messages];
            let newConversationId = prev.conversationId;

            // 更新会话ID
            if (data.conversation_id) {
              newConversationId = data.conversation_id;
            }

            // 处理消息内容
            if (data.content && data.role === 'assistant') {
              if (data.event === 'conversation.message.delta') {
                // 流式更新当前消息
                newCurrentMessage += data.content;
              } else if (data.event === 'conversation.message.completed') {
                // 消息完成，添加到消息列表
                newMessages.push(prev.currentMessage + data.content);
                newCurrentMessage = '';
              }
            }

            return {
              ...prev,
              currentMessage: newCurrentMessage,
              messages: newMessages,
              conversationId: newConversationId
            };
          });
        },
        (error: Error) => {
          setStreamState(prev => ({
            ...prev,
            isStreaming: false,
            error: error.message
          }));
        },
        () => {
          setStreamState(prev => ({
            ...prev,
            isStreaming: false
          }));
        }
      );

      streamRef.current = stream;
    } catch (error) {
      setStreamState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : '未知错误'
      }));
    }
  }, [streamState.isStreaming]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      // 取消流
      streamRef.current.cancel();
      streamRef.current = null;
    }
    
    setStreamState(prev => ({
      ...prev,
      isStreaming: false
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setStreamState(prev => ({
      ...prev,
      messages: [],
      currentMessage: '',
      conversationId: undefined,
      error: undefined
    }));
  }, []);

  return {
    streamState,
    startStream,
    startBirthAnalysis,
    stopStream,
    clearMessages
  };
}
