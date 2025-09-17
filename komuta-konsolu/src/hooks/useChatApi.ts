// src/hooks/useChatApi.ts
// Sadece API'ye istek gönderme ve yanıtı işleme sorumluluğunu taşır.
'use client';

import { ChatMessage, UploadedFile } from './use-chat-hook'; // Tipleri ana hook'tan alabiliriz
import { getMaxTokensForModel, getTemperatureForModel, detectProvider } from '@/lib/ai-helpers';

interface APIResponse {
  success: boolean;
  content?: string;
  error?: { message: string; };
  provider?: string;
  model_used?: string;
}

export const useChatApi = () => {
  const fetchAssistantResponse = async (
    prompt: string,
    model: string,
    conversationHistory: Pick<ChatMessage, 'role' | 'content'>[],
    files?: UploadedFile[]
  ): Promise<Pick<APIResponse, 'content' | 'model_used' | 'provider'>> => {

    const requestPayload = {
      model,
      prompt,
      conversation_history: conversationHistory,
      max_tokens: getMaxTokensForModel(model),
      temperature: getTemperatureForModel(model),
      files: files || [],
    };
    
    console.log('🚀 API isteği gönderiliyor:', { model, provider: detectProvider(model) });

    const response = await fetch('/api/ai-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    let data: APIResponse;
    try {
      data = await response.json();
    } catch (parseErr) {
      throw new Error(`Sunucu yanıtı (JSON) işlenemedi: ${response.statusText}`);
    }
    
    console.log('📥 API yanıtı alındı:', { success: data.success, provider: data.provider });

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || `Bilinmeyen bir API hatası oluştu.`);
    }

    if (!data.content) {
      throw new Error('API içerik döndürmedi.');
    }

    return {
      content: data.content,
      model_used: data.model_used,
      provider: data.provider,
    };
  };

  return { fetchAssistantResponse };
};