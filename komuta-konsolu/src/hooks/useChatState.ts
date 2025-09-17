// src/hooks/useChatState.ts
// Sadece sohbetin temel durumlarını yönetir: mesajlar, yüklenme durumu ve hatalar.
'use client';

import { useState } from 'react';
import { detectProvider } from '@/lib/ai-helpers';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
}

export const useChatState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUserMessage = (content: string, model: string) => {
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content,
      timestamp: new Date(),
      model,
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const addAssistantMessage = (content: string, model: string, provider?: string) => {
    const assistantMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content,
      timestamp: new Date(),
      model,
      provider: provider || detectProvider(model),
    };
    setMessages(prev => [...prev, assistantMessage]);
  };
  
  const addErrorMessage = (errorMessage: string, model: string) => {
    const errorChatMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: `❌ **Hata:** ${errorMessage}`,
      timestamp: new Date(),
      model,
    };
    setMessages(prev => [...prev, errorChatMessage]);
  };

  const resetMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    setIsLoading,
    setError,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    resetMessages,
  };
};