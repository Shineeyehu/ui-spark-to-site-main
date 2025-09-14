import { useState, useCallback, useRef } from 'react';
import MoonshotAPI, { MoonshotConfig, defaultMoonshotConfig } from '@/lib/moonshot-api';

export interface MoonshotState {
  isGenerating: boolean;
  generatedHTML: string;
  error?: string;
  isStreaming: boolean;
  streamContent: string;
}

export interface UseMoonshotReturn {
  moonshotState: MoonshotState;
  generateKnowledgeCard: (userContent: string) => Promise<void>;
  generateKnowledgeCardStream: (userContent: string) => Promise<void>;
  clearError: () => void;
  clearContent: () => void;
}

export function useMoonshot(config?: Partial<MoonshotConfig>): UseMoonshotReturn {
  const [moonshotState, setMoonshotState] = useState<MoonshotState>({
    isGenerating: false,
    generatedHTML: '',
    error: undefined,
    isStreaming: false,
    streamContent: ''
  });

  const moonshotAPI = useRef(new MoonshotAPI({ ...defaultMoonshotConfig, ...config }));
  const streamRef = useRef<ReadableStream<string> | null>(null);

  const generateKnowledgeCard = useCallback(async (userContent: string) => {
    if (moonshotState.isGenerating) {
      return;
    }

    setMoonshotState(prev => ({
      ...prev,
      isGenerating: true,
      error: undefined,
      generatedHTML: ''
    }));

    try {
      const htmlContent = await moonshotAPI.current.generateKnowledgeCard(
        userContent,
        undefined, // onMessage
        (error: Error) => {
          setMoonshotState(prev => ({
            ...prev,
            isGenerating: false,
            error: error.message
          }));
        },
        () => {
          setMoonshotState(prev => ({
            ...prev,
            isGenerating: false
          }));
        }
      );

      if (htmlContent) {
        setMoonshotState(prev => ({
          ...prev,
          generatedHTML: htmlContent,
          isGenerating: false
        }));
      }
    } catch (error) {
      setMoonshotState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : '未知错误'
      }));
    }
  }, [moonshotState.isGenerating]);

  const generateKnowledgeCardStream = useCallback(async (userContent: string) => {
    if (moonshotState.isStreaming) {
      return;
    }

    setMoonshotState(prev => ({
      ...prev,
      isStreaming: true,
      error: undefined,
      streamContent: '',
      generatedHTML: ''
    }));

    try {
      const stream = await moonshotAPI.current.generateKnowledgeCardStream(
        userContent,
        (content: string) => {
          setMoonshotState(prev => ({
            ...prev,
            streamContent: prev.streamContent + content
          }));
        },
        (error: Error) => {
          setMoonshotState(prev => ({
            ...prev,
            isStreaming: false,
            error: error.message
          }));
        },
        () => {
          setMoonshotState(prev => ({
            ...prev,
            isStreaming: false,
            generatedHTML: prev.streamContent
          }));
        }
      );

      streamRef.current = stream;
    } catch (error) {
      setMoonshotState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : '未知错误'
      }));
    }
  }, [moonshotState.isStreaming]);

  const clearError = useCallback(() => {
    setMoonshotState(prev => ({
      ...prev,
      error: undefined
    }));
  }, []);

  const clearContent = useCallback(() => {
    setMoonshotState(prev => ({
      ...prev,
      generatedHTML: '',
      streamContent: '',
      error: undefined
    }));
  }, []);

  return {
    moonshotState,
    generateKnowledgeCard,
    generateKnowledgeCardStream,
    clearError,
    clearContent
  };
}
