// src/hooks/use-chat-hook.ts - Dosya desteği eklendi
'use client';
import { useState, useCallback } from 'react';
import { ProcessedFile } from '@/lib/file-helpers';
import { processFile, validateFile } from '@/lib/file-helpers';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: ProcessedFile[];
  model?: string;
  provider?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  model: string;
  conversationHistory: Array<{role: string, content: string}>;
  uploadedFiles: ProcessedFile[];
}

interface SendMessageOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// ID generator utility
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};


export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    model: 'claude-3-5-sonnet-20241022',
    conversationHistory: [],
    uploadedFiles: []
  });

  const uploadFiles = useCallback(async (files: FileList | File[] | ProcessedFile[]) => {
    const fileArray = Array.from(files);
    const processedFiles: ProcessedFile[] = [];

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      for (const file of fileArray) {
        // Eğer zaten ProcessedFile ise direkt ekle
        if ('data' in file && 'category' in file) {
          processedFiles.push(file as ProcessedFile);
          continue;
        }
        
        // Normal File objesi ise işle
        const regularFile = file as File;
        
        // Validasyon
        const validation = validateFile(regularFile);
        if (!validation.isValid) {
          throw new Error(`${regularFile.name}: ${validation.error}`);
        }

        const processedFile = await processFile(regularFile);
        processedFiles.push(processedFile);
      }

      setState(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...processedFiles],
        isLoading: false
      }));

      console.log('✅ Dosyalar yüklendi:', processedFiles.map(f => f.name));
      return processedFiles;

    } catch (error: any) {
      console.error('❌ Dosya yükleme hatası:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Dosya yükleme hatası'
      }));
      throw error;
    }
  }, []);


  // Yüklenen dosyaları temizleme
  const clearUploadedFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadedFiles: []
    }));
  }, []);

  // Belirli bir dosyayı kaldırma
  const removeFile = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId)
    }));
  }, []);

  // Mesaj gönderme fonksiyonu
  const sendMessage = useCallback(async (
    prompt: string, 
    files?: ProcessedFile[], 
    options?: SendMessageOptions
  ) => {
    if (!prompt.trim()) return;

    // Kullanılacak dosyalar (parametre olarak gelenler veya yüklenmiş olanlar)
    const messagFiles = files || state.uploadedFiles;

    // User mesajını ekle
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      files: messagFiles.length > 0 ? messagFiles : undefined,
      model: options?.model || state.model
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      const payload = {
        model: options?.model || state.model,
        prompt: prompt,
        conversation_history: state.conversationHistory,
        files: messagFiles.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          data: f.data, // Base64 data URL
          category: f.category,
          contentType: f.contentType || 'unknown'
        })), // Dosya formatını düzelt
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 4096
      };


      console.log('🚀 AI Gateway\'e gönderiliyor:', {
        model: payload.model,
        promptLength: prompt.length,
        filesCount: messagFiles?.length || 0,
        historyLength: state.conversationHistory.length,
        fileTypes: messagFiles?.map(f => f.type) || []
      });

      const response = await fetch('/api/ai-gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success && data.error) {
        throw new Error(data.error.message || 'AI yanıt hatası');
      }

      // Assistant mesajını ekle
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.content || data.message || 'Yanıt alınamadı',
        timestamp: new Date(),
        model: data.model_used || options?.model || state.model,
        provider: data.provider
      };

      // Conversation history'yi güncelle
      const newHistory = [
        ...state.conversationHistory,
        { role: 'user', content: prompt },
        { role: 'assistant', content: assistantMessage.content }
      ].slice(-20); // Son 20 mesajı tut

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        conversationHistory: newHistory,
        uploadedFiles: [] // Mesaj gönderildikten sonra yüklenen dosyaları temizle
      }));

      console.log('✅ AI yanıtı alındı:', {
        model: data.model_used,
        provider: data.provider,
        contentLength: assistantMessage.content.length
      });

    } catch (error: any) {
      console.error('❌ Chat hook hatası:', error);
      const errorMessage = error.message || 'Bilinmeyen bir hata oluştu.';
      
      // Hata mesajını chat'e ekle
      const errorChatMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `⚠️ Hata: ${errorMessage}`,
        timestamp: new Date(),
        model: options?.model || state.model
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorChatMessage],
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [state.model, state.conversationHistory, state.uploadedFiles]);

  // Model değiştirme
  const changeModel = useCallback((newModel: string) => {
    setState(prev => ({
      ...prev,
      model: newModel
    }));
  }, []);

  // Chat'i sıfırlama
  const resetChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      model: state.model, // Mevcut modeli koru
      conversationHistory: [],
      uploadedFiles: []
    });
  }, [state.model]);

  // Hata temizleme
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Public interface
  return {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    model: state.model,
    uploadedFiles: state.uploadedFiles,
    
    // Actions
    sendMessage,
    uploadFiles,
    clearUploadedFiles,
    removeFile,
    changeModel,
    resetChat,
    clearError
  };
}