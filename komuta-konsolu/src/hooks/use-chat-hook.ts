// hooks/use-chat-hook.ts
// Çoklu AI destekli chat hook'u - GÖRSEL VE VİDEO DESTEĞİ EKLENMİŞ

'use client';

import { useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
  attachments?: UploadedFile[]; // Dosya ekleri için
  // Yeni alanlar - görsel/video desteği
  kind?: 'text' | 'image' | 'video'; // Mesaj türü
  status?: 'pending' | 'processing' | 'completed' | 'failed'; // İşlem durumu
  jobId?: string; // Asenkron job ID (video için)
  url?: string; // Oluşturulan görsel/video URL'i
  assetId?: string; // Asset ID (signed URL için)
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded content
  mimeType: string; // MIME type
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
  // Yeni alanlar - multimodal yanıt
  kind?: 'text' | 'image' | 'video';
  jobId?: string;
  url?: string;
  assetId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export const useChat = ({ model, onError, onSuccess }: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Polling işlemi için aktif job'ları takip et
  const [activeJobs, setActiveJobs] = useState<Set<string>>(new Set());

  // Dosya yükleme fonksiyonu
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64Data = reader.result as string;
        // "data:mime/type;base64," kısmını kaldır
        const cleanBase64 = base64Data.split(',')[1];
        
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: getFileTypeFromExtension(file.name),
          size: file.size,
          data: cleanBase64,
          mimeType: file.type || 'application/octet-stream'
        };
        
        resolve(uploadedFile);
      };
      
      reader.onerror = () => {
        reject(new Error(`Dosya okunamadı: ${file.name}`));
      };
      
      // Dosyayı base64 olarak oku
      reader.readAsDataURL(file);
    });
  };

  // Dosya ekle
  const addFiles = async (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Dosya boyutu kontrolü (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        onError?.(`Dosya çok büyük: ${file.name} (Max: 10MB)`);
        continue;
      }
      
      try {
        const uploadedFile = await uploadFile(file);
        newFiles.push(uploadedFile);
        console.log(`✅ Dosya yüklendi: ${file.name} (${file.size} bytes)`);
      } catch (err: any) {
        console.error(`❌ Dosya yükleme hatası: ${file.name}`, err);
        onError?.(err.message);
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    return newFiles;
  };

  // Dosya kaldır
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Tüm dosyaları temizle
  const clearFiles = () => {
    setUploadedFiles([]);
  };

  // Video job durumunu polling ile kontrol et
  const pollJobStatus = async (jobId: string, messageId: string) => {
    if (activeJobs.has(jobId)) return; // Zaten polling yapılıyor
    
    setActiveJobs(prev => new Set(prev).add(jobId));
    
    const maxAttempts = 60; // 5 dakika (5sn aralıkla)
    let attempts = 0;
    
    const poll = async () => {
      try {
        console.log(`🔄 Polling job ${jobId}, attempt ${attempts + 1}`);
        
        const response = await fetch(`/api/ai-gateway/status/${jobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'completed' && data.url) {
          // Job tamamlandı, mesajı güncelle
          console.log(`✅ Job ${jobId} completed: ${data.url}`);
          
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  status: 'completed', 
                  url: data.url,
                  assetId: data.assetId,
                  content: msg.content + '\n\n✅ Video hazır!'
                }
              : msg
          ));
          
          setActiveJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
          
          return; // Polling'i durdur
        } else if (data.status === 'failed') {
          // Job başarısız
          console.error(`❌ Job ${jobId} failed:`, data.error);
          
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  status: 'failed',
                  content: msg.content + '\n\n❌ Video oluşturma başarısız oldu.'
                }
              : msg
          ));
          
          setActiveJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
          
          return; // Polling'i durdur
        }
        
        // Hala processing durumunda, devam et
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // 5 saniye bekle
        } else {
          // Timeout
          console.warn(`⏰ Job ${jobId} polling timeout`);
          
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  status: 'failed',
                  content: msg.content + '\n\n⏰ Video oluşturma zaman aşımına uğradı.'
                }
              : msg
          ));
          
          setActiveJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
        
      } catch (err: any) {
        console.error(`❌ Job ${jobId} polling error:`, err);
        attempts++;
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Hata durumunda da tekrar dene
        } else {
          setActiveJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      }
    };
    
    // İlk kontrolü hemen yap
    setTimeout(poll, 2000); // 2 saniye bekle (işleme başlaması için)
  };

  const sendMessage = async (prompt: string, additionalFiles?: UploadedFile[], messageMode?: 'chat' | 'image' | 'video') => {
    if (!prompt.trim() && uploadedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);

    // Varsayılan mod belirleme (model bazlı)
    let mode = messageMode || 'chat';
    if (!messageMode) {
      if (model.includes('dall-e')) mode = 'image';
      else if (model.includes('veo')) mode = 'video';
    }

    // Tüm dosyaları birleştir
    const allFiles = [...uploadedFiles, ...(additionalFiles || [])];

    // Kullanıcı mesajını ekle
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      model,
      attachments: allFiles.length > 0 ? allFiles : undefined,
      kind: 'text' // Kullanıcı mesajları her zaman text
    };

    setMessages(prev => [...prev, userMessage]);

    // Conversation history hazırla (son 15 mesaj - dosya boyutu için azaltıldı)
    const conversationHistory = messages
      .slice(-15)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        attachments: msg.attachments // Dosya geçmişini de ekle
      }));

    try {
      // Dosya bilgilerini formatla
      const processedFiles = allFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        mimeType: file.mimeType,
        content: file.data, // Base64 content
        // Dosya preview'u için ilk 500 karakter (text dosyaları için)
        preview: isTextFile(file.mimeType) ? 
          atob(file.data).substring(0, 500) + (atob(file.data).length > 500 ? '...' : '') 
          : null
      }));

      // API request payload'u hazırla
      const requestPayload = {
        model,
        prompt: prompt || "Yüklenen dosyaları analiz et.",
        conversation_history: conversationHistory,
        max_tokens: getMaxTokensForModel(model),
        temperature: getTemperatureForModel(model),
        files: processedFiles,
        mode: mode // Yeni alan: chat/image/video
      };

      console.log('🚀 API isteği gönderiliyor:', {
        model,
        provider: detectProvider(model),
        historyLength: conversationHistory.length,
        filesCount: processedFiles.length,
        totalFileSize: processedFiles.reduce((sum, f) => sum + f.size, 0),
        mode
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
        provider: data.provider,
        kind: data.kind,
        jobId: data.jobId,
        url: data.url
      });

      if (!response.ok) {
        const errorMsg = data.error?.message || `HTTP ${response.status} Error`;
        throw new Error(errorMsg);
      }

      if (!data.success) {
        const errorMsg = data.error?.message || 'API request failed';
        throw new Error(errorMsg);
      }

      if (!data.content && !data.url && !data.jobId) {
        throw new Error('API returned no content, URL, or job ID');
      }

      // AI yanıtını ekle
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: data.content || (data.kind === 'video' ? '🎬 Video oluşturuluyor...' : '🖼️ Görsel oluşturuluyor...'),
        timestamp: new Date(),
        model: data.model_used || model,
        provider: data.provider || detectProvider(model),
        // Multimodal alanlar
        kind: data.kind || 'text',
        status: data.status || (data.jobId ? 'processing' : 'completed'),
        jobId: data.jobId,
        url: data.url,
        assetId: data.assetId
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Video job'u için polling başlat
      if (data.kind === 'video' && data.jobId && data.status === 'processing') {
        console.log(`🔄 Starting polling for job ${data.jobId}`);
        pollJobStatus(data.jobId, assistantMessage.id);
      }
      
      // Başarılı gönderim sonrası dosyaları temizle
      clearFiles();
      
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
        kind: 'text',
        status: 'failed'
      };

      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
    clearFiles();
    // Aktif job'ları temizle
    setActiveJobs(new Set());
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
    // Dosya yönetimi
    uploadedFiles,
    addFiles,
    removeFile,
    clearFiles,
    uploadFile,
    // Video job tracking
    activeJobs
  };
};

// Yardımcı fonksiyonlar
function detectProvider(model: string): string {
  if (model.includes('claude')) return 'anthropic';
  if (model.includes('gpt') || model.includes('o1') || model.includes('o3') || model.includes('o4') || model.includes('dall-e')) return 'openai';
  if (model.includes('gemini') || model.includes('veo')) return 'google';
  return 'unknown';
}

function getFileTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const typeMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript', 
    'tsx': 'typescript',
    'jsx': 'javascript',
    'py': 'python',
    'css': 'css',
    'html': 'html',
    'htm': 'html',
    'json': 'json',
    'txt': 'text',
    'md': 'markdown',
    'xml': 'xml',
    'sql': 'sql',
    'yml': 'yaml',
    'yaml': 'yaml',
    'pdf': 'pdf',
    'doc': 'document',
    'docx': 'document',
    'xls': 'spreadsheet',
    'xlsx': 'spreadsheet',
    'csv': 'csv',
    'png': 'image',
    'jpg': 'image',
    'jpeg': 'image',
    'gif': 'image',
    'webp': 'image'
  };
  
  return typeMap[ext] || 'unknown';
}

function isTextFile(mimeType: string): boolean {
  return mimeType.startsWith('text/') || 
         mimeType === 'application/json' ||
         mimeType === 'application/javascript' ||
         mimeType === 'application/xml';
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
    
    // Image/Video models - daha düşük token limit
    'dall-e-2': 1000,
    'dall-e-3': 1000,
    'veo-3': 2000,
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
  if (model.includes('dall-e') || model.includes('veo')) return 1000;

  return 4096; // varsayılan
}

function getTemperatureForModel(model: string): number {
  // O-series modelleri sabit 1.0 temperature kullanır
  if (model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) {
    return 1.0;
  }
  
  // Image/Video modelleri için düşük creativity
  if (model.includes('dall-e') || model.includes('veo')) {
    return 0.5;
  }
  
  // Diğer modeller için varsayılan
  return 0.7;
}