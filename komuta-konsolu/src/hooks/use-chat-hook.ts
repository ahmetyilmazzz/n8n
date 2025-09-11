// hooks/use-chat-hook.ts
// Çoklu AI destekli chat hook'u - DÜZELTİLMİŞ versiyon

'use client';

import { useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
}

interface UseChatOptions {
  model: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

interface APIResponse {
  success: boolean;
  content?: string;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  provider?: string;
  model_used?: string;
}

export const useChat = ({ model, onError, onSuccess }: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (prompt: string, files?: UploadedFile[]) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    // Kullanıcı mesajını ekle
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      model,
    };

    setMessages(prev => [...prev, userMessage]);

    // Conversation history hazırla (son 20 mesaj)
    const conversationHistory = messages
      .slice(-20) // Daha fazla context için artırıldı
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    try {
      // API request payload'u hazırla
      const requestPayload = {
        model,
        prompt,
        conversation_history: conversationHistory,
        max_tokens: getMaxTokensForModel(model),
        temperature: getTemperatureForModel(model),
        files: files || []
      };

      console.log('🚀 API isteği gönderiliyor:', {
        model,
        provider: detectProvider(model),
        historyLength: conversationHistory.length,
        hasFiles: (files?.length || 0) > 0
      });

      // API çağrısı
      const response = await fetch('/api/ai-gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      let data: APIResponse;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`Sunucu yanıtı işlenemedi: ${response.status} ${response.statusText}`);
      }

      console.log('📥 API yanıtı:', { 
        success: data.success, 
        hasContent: !!data.content,
        error: data.error?.message,
        provider: data.provider 
      });

      if (!response.ok) {
        const errorMsg = data.error?.message || `HTTP ${response.status} Error`;
        throw new Error(errorMsg);
      }

      if (!data.success) {
        const errorMsg = data.error?.message || 'API request failed';
        throw new Error(errorMsg);
      }

      if (!data.content) {
        throw new Error('API returned no content');
      }

      // AI yanıtını ekle
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        model: data.model_used || model,
        provider: data.provider || detectProvider(model),
      };

      setMessages(prev => [...prev, assistantMessage]);
      onSuccess?.();

    } catch (err: any) {
      console.error('❌ Chat hook error:', err);
      const errorMessage = err.message || 'Bilinmeyen hata oluştu';
      
      setError(errorMessage);
      onError?.(errorMessage);

      // Hata mesajını chat'e ekle
      const errorChatMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: `❌ **Hata:** ${errorMessage}`,
        timestamp: new Date(),
        model,
      };

      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
  };
};

// Yardımcı fonksiyonlar
function detectProvider(model: string): string {
  if (model.includes('claude')) return 'anthropic';
  if (model.includes('gpt') || model.includes('o1') || model.includes('o3') || model.includes('o4')) return 'openai';
  if (model.includes('gemini') || model.includes('veo')) return 'google';
  return 'unknown';
}

function getMaxTokensForModel(model: string): number {
  // Güncellenmiş ve gerçekçi token limitleri
  const modelLimits: Record<string, number> = {
    // OpenAI O-series
    'o1-preview': 32768,
    'o1-mini': 65536,
    'o1-pro': 32768,
    
    // OpenAI GPT-4 series (gerçek limitler)
    'gpt-4o': 4096,
    'gpt-4o-mini': 4096,
    'gpt-4-turbo': 4096,
    'gpt-4': 4096,
    'gpt-3.5-turbo': 4096,
    
    // Deneysel modeller (düşük limitler)
    'gpt-5': 4096,
    'gpt-5-mini': 4096,
    'o3': 32000,
    'o3-pro': 32000,
    
    // Claude series
    'claude-3-5-sonnet-20241022': 4096,
    'claude-3-5-haiku-20241022': 4096,
    'claude-3-opus-20240229': 4096,
    'claude-3-sonnet-20240229': 4096,
    'claude-3-haiku-20240307': 4096,
    'claude-sonnet-4-20250514': 8192,
    'claude-opus-4': 8192,
    
    // Gemini series
    'gemini-1.5-pro': 8192,
    'gemini-1.5-flash': 8192,
    'gemini-1.0-pro': 4096,
    'gemini-2.5-pro': 8192,
    'gemini-2.5-flash': 8192,
  };

  // Model-specific limit döndür
  if (modelLimits[model]) {
    return modelLimits[model];
  }

  // Provider-based fallback
  if (model.includes('claude')) return 4096;
  if (model.includes('gpt-4') || model.includes('o1')) return 4096;
  if (model.includes('gpt-3.5')) return 4096;
  if (model.includes('gemini')) return 8192;

  return 4096; // varsayılan
}

function getTemperatureForModel(model: string): number {
  // O-series modelleri sabit 1.0 temperature kullanır
  if (model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) {
    return 1.0;
  }
  
  // Diğer modeller için varsayılan
  return 0.7;
}