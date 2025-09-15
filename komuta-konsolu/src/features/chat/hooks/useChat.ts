'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage, SendMessageOptions } from '@/types/message';
import { UploadedFile } from '@/types/attachments';

interface UseChatOptions {
  model: string;
  onError?: (error: string) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, files?: UploadedFile[]) => void;
  resetChat: () => void;
}

export function useChat({ model, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string, files?: UploadedFile[]) => {
    if (!content.trim()) return;
    
    // İptal edilmiş istek varsa temizle
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments: files || []
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          model: model,
          files: files || []
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: data.response || data.message || 'Boş yanıt alındı',
        timestamp: new Date(),
        modelUsed: model
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // İptal edildi, hata gösterme
          return;
        }
        
        const errorMessage = err.message || 'Beklenmeyen bir hata oluştu';
        setError(errorMessage);
        onError?.(errorMessage);
      } else {
        const unknownError = 'Bilinmeyen bir hata oluştu';
        setError(unknownError);
        onError?.(unknownError);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [model, onError]);

  const resetChat = useCallback(() => {
    // Devam eden isteği iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat
  };
}