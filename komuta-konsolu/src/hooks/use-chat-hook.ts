// src/hooks/use-chat-hook.ts
// Orkestra şefi hook. Diğer hook'ları kullanarak sohbet mantığını yönetir.
'use client';

import { useChatState, ChatMessage } from './useChatState';
import { useFileManagement, UploadedFile } from './useFileManagement';
import { useChatApi } from './useChatApi';

export type { ChatMessage, UploadedFile }; // Tipleri buradan dışa aktararak tek bir yerden yönetebiliriz

interface UseChatOptions {
  model: string; // Hangi modelin kullanılacağı page.tsx'ten gelir
}

export const useChat = ({ model }: UseChatOptions) => {
  // Uzmanlaşmış hook'ları çağır
  const {
    messages, isLoading, error,
    setIsLoading, setError,
    addUserMessage, addAssistantMessage, addErrorMessage,
    resetMessages
  } = useChatState();
  
  // page.tsx dosyasının bu hook'u kullanmasına gerek yok, çünkü ana hook dosya mantığını yönetecek
  const { uploadedFiles, clearUploadedFiles, resetFiles } = useFileManagement(); 
  
  const { fetchAssistantResponse } = useChatApi();

  // Ana sendMessage fonksiyonu
  const sendMessage = async (prompt: string, files?: UploadedFile[]) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    addUserMessage(prompt, model);

    // Konuşma geçmişini hazırla
    const conversationHistory = messages.slice(-20).map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    
    try {
      // API'den yanıtı al
      const apiResponse = await fetchAssistantResponse(prompt, model, conversationHistory, files);
      
      // Gelen yanıta göre state'i güncelle
      addAssistantMessage(
        apiResponse.content!,
        apiResponse.model_used || model,
        apiResponse.provider
      );
      
      clearUploadedFiles(); // Mesaj gönderildikten sonra yüklenen dosyaları temizle

    } catch (err: any) {
      console.error('❌ Ana chat hook hatası:', err);
      const errorMessage = err.message || 'Bilinmeyen bir hata oluştu.';
      setError(errorMessage);
      addErrorMessage(errorMessage, model); // Hata mesajını arayüze ekle
    } finally {
      setIsLoading(false);
    }
  };

  // Genel sıfırlama fonksiyonu
  const resetChat = () => {
    resetMessages();
    resetFiles();
  };

  // page.tsx'in ihtiyacı olan her şeyi tek bir yerden sun
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
  };
};