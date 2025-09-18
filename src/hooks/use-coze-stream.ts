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
                // 消息完成，使用完整的内容作为最终消息
                const finalMessage = data.content || prev.currentMessage;
                if (finalMessage.trim()) {
                  newMessages.push(finalMessage);
                }
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

            // 处理消息内容 - 只处理conversation.message.completed事件的完整内容
            if (data.content && data.role === 'assistant' && data.content.trim().length > 0) {
              // 检查内容是否有意义（不是纯技术信息）
              const isTechnicalOnly = data.content.includes('plugin_id') || 
                data.content.includes('api_id') ||
                data.content.includes('tool_call') ||
                (data.content.startsWith('{') && data.content.endsWith('}') && data.content.length < 100);
              
              // 只处理conversation.message.completed事件，忽略delta增量更新
              if (data.event === 'conversation.message.completed') {
                // 如果不是纯技术信息，或者内容较长（可能包含命理报告），则保留
                if (!isTechnicalOnly || data.content.length > 50) {
                  // 消息完成，直接使用completed事件中的完整内容
                  const finalMessage = data.content; // 只使用completed事件的内容，不合并delta
                  if (finalMessage.trim().length > 0) {
                    newMessages.push(finalMessage);
                    console.log('添加completed消息到列表:', finalMessage.substring(0, 100) + '...');
                  }
                }
                // 清空当前消息（如果有的话）
                newCurrentMessage = '';
              } else if (data.event === 'conversation.message.delta') {
                // 对于delta事件，只更新当前消息用于实时显示，但不保存到最终消息列表
                if (!isTechnicalOnly || data.content.length > 50) {
                  newCurrentMessage += data.content;
                  console.log('更新当前delta消息:', newCurrentMessage.substring(0, 100) + '...');
                }
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
    
    setStreamState(prev => {
      // 如果有当前正在流式传输的消息，保存到消息列表中
      const newMessages = [...prev.messages];
      if (prev.currentMessage && prev.currentMessage.trim().length > 0) {
        newMessages.push(prev.currentMessage);
      }
      
      return {
        ...prev,
        isStreaming: false,
        messages: newMessages,
        currentMessage: '' // 清空当前消息
      };
    });
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
