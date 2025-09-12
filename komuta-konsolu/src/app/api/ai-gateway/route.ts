// app/api/ai-gateway/route.ts
// Geliştirilmiş Multi-AI Gateway - DOSYA DESTEĞİ EKLENMİŞ

export const dynamic = 'force-dynamic';

// Model validasyon listeleri - Tip güvenli
const VALID_MODELS: Record<string, string[]> = {
  claude: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022', 
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  openai: [
    'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4-turbo-preview',
    'gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k',
    'o1-preview', 'o1-mini',
    'dall-e-3', 'dall-e-2'
  ],
  google: [
    'gemini-1.5-pro', 'gemini-1.5-pro-exp-0827',
    'gemini-1.5-flash', 'gemini-1.5-flash-8b',
    'gemini-1.0-pro'
  ]
};

// Model fallback haritası
const MODEL_FALLBACKS: Record<string, string> = {
  'gpt-5': 'gpt-4o',
  'gpt-5-mini': 'gpt-4o-mini',
  'o3': 'o1-preview',
  'o3-pro': 'o1-preview',
  'o4-mini': 'o1-mini',
  'claude-sonnet-4-20250514': 'claude-3-5-sonnet-20241022',
  'claude-opus-4': 'claude-3-opus-20240229',
  'gemini-2.5-pro': 'gemini-1.5-pro',
  'gemini-2.5-flash': 'gemini-1.5-flash',
  'veo-3': 'gemini-1.5-pro'
};

// Dosya türü interface
interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  content: string; // Base64 content
  preview?: string | null;
}

// Desteklenen provider tipleri
type AIProvider = 'claude' | 'openai' | 'google';

// Provider tespit fonksiyonu
function detectAIProvider(model: string): AIProvider {
  if (!model || typeof model !== 'string') {
    return 'claude';
  }
  
  const modelLower = model.toLowerCase();
  
  if (modelLower.includes('claude')) return 'claude';
  if (modelLower.includes('gpt') || modelLower.includes('o1') || 
      modelLower.includes('o3') || modelLower.includes('o4') || 
      modelLower.includes('dall-e')) return 'openai';
  if (modelLower.includes('gemini') || modelLower.includes('veo')) return 'google';
  
  return 'claude';
}

// Model validasyon ve fallback fonksiyonu
function validateAndMapModel(model: string): { 
  model: string; 
  provider: AIProvider; 
  isFallback: boolean 
} {
  if (!model || typeof model !== 'string' || model.trim() === '') {
    console.warn('⚠️ Model bilgisi eksik, varsayılan kullanılıyor');
    return {
      model: 'claude-3-5-sonnet-20241022',
      provider: 'claude',
      isFallback: true
    };
  }

  const trimmedModel = model.trim();
  const provider = detectAIProvider(trimmedModel);
  
  if (MODEL_FALLBACKS[trimmedModel]) {
    const fallbackModel = MODEL_FALLBACKS[trimmedModel];
    console.log(`🔄 Model fallback: ${trimmedModel} -> ${fallbackModel}`);
    return {
      model: fallbackModel,
      provider: detectAIProvider(fallbackModel),
      isFallback: true
    };
  }
  
  const validModels = VALID_MODELS[provider] || [];
  if (validModels.includes(trimmedModel)) {
    return { 
      model: trimmedModel, 
      provider, 
      isFallback: false 
    };
  }
  
  const defaultFallbacks: Record<string, string> = {
    claude: 'claude-3-5-sonnet-20241022',
    openai: 'gpt-4o',
    google: 'gemini-1.5-pro'
  };
  
  const fallbackModel = defaultFallbacks[provider];
  console.warn(`⚠️ Geçersiz model ${trimmedModel}, fallback: ${fallbackModel}`);
  
  return {
    model: fallbackModel,
    provider,
    isFallback: true
  };
}

// Dosya işleme fonksiyonu
function processFilesForAI(files: ProcessedFile[], provider: AIProvider): any[] {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  console.log(`📁 ${files.length} dosya işleniyor (${provider} için)`);

  return files.map(file => {
    // Temel dosya bilgileri
    const processedFile: any = {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      mimeType: file.mimeType
    };

    // Provider'a göre format
    switch (provider) {
      case 'claude':
        // Claude resim ve metin dosyalarını destekler
        if (file.mimeType.startsWith('image/')) {
          processedFile.content_type = 'image';
          processedFile.data = file.content; // Base64
        } else if (isTextFile(file.mimeType)) {
          processedFile.content_type = 'text';
          processedFile.text_content = decodeBase64(file.content);
        } else {
          processedFile.content_type = 'document';
          processedFile.summary = `Dosya: ${file.name} (${file.size} bytes, ${file.mimeType})`;
        }
        break;

      case 'openai':
        // GPT-4 Vision resim desteği
        if (file.mimeType.startsWith('image/') && file.mimeType !== 'image/svg+xml') {
          processedFile.content_type = 'image';
          processedFile.data = file.content;
        } else if (isTextFile(file.mimeType)) {
          processedFile.content_type = 'text'; 
          processedFile.text_content = decodeBase64(file.content);
        } else {
          processedFile.content_type = 'document';
          processedFile.summary = `Dosya yüklendi: ${file.name}`;
        }
        break;

      case 'google':
        // Gemini çoklu medya desteği
        if (file.mimeType.startsWith('image/')) {
          processedFile.content_type = 'image';
          processedFile.inline_data = {
            mime_type: file.mimeType,
            data: file.content
          };
        } else if (isTextFile(file.mimeType)) {
          processedFile.content_type = 'text';
          processedFile.text_content = decodeBase64(file.content);
        } else {
          processedFile.content_type = 'document';
          processedFile.summary = `Dosya: ${file.name} (${formatFileSize(file.size)})`;
        }
        break;
    }

    return processedFile;
  });
}

// Yardımcı fonksiyonlar
function isTextFile(mimeType: string): boolean {
  const textTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/csv'
  ];
  
  return textTypes.some(type => mimeType.includes(type));
}

function decodeBase64(base64: string): string {
  try {
    return atob(base64);
  } catch (err) {
    console.error('Base64 decode hatası:', err);
    return '[Dosya içeriği okunamadı]';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Error response helper
function createErrorResponse(
  message: string, 
  code: string, 
  status: number = 500, 
  additionalData: Record<string, any> = {}
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { 
        message, 
        code, 
        status,
        timestamp: new Date().toISOString(),
        ...additionalData 
      }
    }),
    { 
      status, 
      headers: { 
        'content-type': 'application/json',
        'x-gateway-error': 'true'
      } 
    }
  );
}

// Ana POST handler
export async function POST(req: Request): Promise<Response> {
  console.log('🚀 Multi-AI Gateway: İstek alındı');
  
  try {
    // İstek gövdesini parse et
    let body: any;
    try {
      body = await req.json();
      console.log('📤 Gateway: Gönderilen veri:', {
        model: body.model,
        promptLength: body.prompt?.length || 0,
        filesCount: body.files?.length || 0,
        historyLength: body.conversation_history?.length || 0
      });
    } catch (err) {
      console.error('❌ Gateway: İstek gövdesi JSON parse edilemedi:', err);
      return createErrorResponse(
        'Geçersiz JSON formatı', 
        'INVALID_JSON', 
        400
      );
    }

    // Model validasyon ve mapping
    const { model: validatedModel, provider, isFallback } = validateAndMapModel(body.model);
    
    console.log(`🎯 Model Mapping: ${body.model || 'undefined'} -> ${validatedModel} (${provider})`);
    if (isFallback) {
      console.log(`🔄 Fallback kullanıldı: ${body.model} -> ${validatedModel}`);
    }

    // Dosyaları işle
    const processedFiles = processFilesForAI(body.files || [], provider);
    
    if (processedFiles.length > 0) {
      console.log(`📁 ${processedFiles.length} dosya ${provider} formatında işlendi`);
      
      // Dosya boyut kontrolü (toplam 50MB limit)
      const totalSize = (body.files || []).reduce((sum: number, file: any) => sum + (file.size || 0), 0);
      if (totalSize > 50 * 1024 * 1024) {
        return createErrorResponse(
          'Toplam dosya boyutu 50MB limitini aşıyor',
          'FILE_SIZE_EXCEEDED',
          413,
          { totalSize: formatFileSize(totalSize) }
        );
      }
    }

    // Enhanced body hazırla
    const enhancedBody = {
      ...body,
      model: validatedModel,
      provider: provider,
      original_model: body.model || null,
      is_fallback: isFallback,
      timestamp: new Date().toISOString(),
      // İşlenmiş dosyalar
      processed_files: processedFiles,
      files_count: processedFiles.length,
      // Conversation history
      conversation_history: Array.isArray(body.conversation_history) ? body.conversation_history : []
    };

    console.log('📡 Gateway: n8n webhook\'una istek gönderiliyor...');

    // n8n webhook URL'i
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/ai-gateway';
    
    // Modern AbortController ile timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 dakika (dosyalar için)

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'content-type': 'application/json',
          'user-agent': 'multi-ai-gateway/2.2',
          'x-ai-provider': provider,
          'x-original-model': body.model || 'unknown',
          'x-validated-model': validatedModel,
          'x-is-fallback': isFallback.toString(),
          'x-files-count': processedFiles.length.toString()
        },
        body: JSON.stringify(enhancedBody),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const status = n8nResponse.status;
    const contentType = n8nResponse.headers.get('content-type') || '';
    
    console.log(`📊 Gateway: n8n yanıt durumu: ${status} ${n8nResponse.statusText}`);

    // Yanıt metnini al
    let responseText: string;
    try {
      responseText = await n8nResponse.text();
      console.log('📥 Gateway: n8n ham yanıtı alındı, uzunluk:', responseText.length);
    } catch (err) {
      console.error('❌ Gateway: n8n yanıtı okunamadı:', err);
      return createErrorResponse(
        'n8n yanıtı okunamadı', 
        'READ_ERROR', 
        502,
        { provider }
      );
    }

    // Boş yanıt kontrolü
    if (!responseText.trim()) {
      console.warn('⚠️ Gateway: n8n boş yanıt döndü');
      return createErrorResponse(
        `${provider.toUpperCase()} sisteminden boş yanıt`, 
        'EMPTY_RESPONSE', 
        502,
        { provider }
      );
    }

    // JSON yanıt işleme
    if (contentType.includes('application/json')) {
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log(`✅ Gateway: ${provider.toUpperCase()} JSON yanıtı başarıyla parse edildi`);
        
        // Metadata ekle
        if (jsonResponse && typeof jsonResponse === 'object' && jsonResponse !== null) {
          jsonResponse.provider = provider;
          jsonResponse.model_used = validatedModel;
          jsonResponse.original_model = body.model || null;
          jsonResponse.is_fallback = isFallback;
          jsonResponse.files_processed = processedFiles.length;
          jsonResponse.response_time = new Date().toISOString();
        }
        
        return new Response(JSON.stringify(jsonResponse), {
          status,
          headers: { 
            'content-type': 'application/json',
            'x-ai-provider': provider,
            'x-model-used': validatedModel,
            'x-is-fallback': isFallback.toString(),
            'x-files-processed': processedFiles.length.toString()
          },
        });
      } catch (parseErr) {
        console.error(`❌ Gateway: ${provider.toUpperCase()} JSON parse hatası:`, parseErr);
        
        return createErrorResponse(
          `${provider.toUpperCase()} geçersiz JSON döndü`, 
          'INVALID_JSON_FROM_AI', 
          502,
          { 
            provider, 
            details: responseText.substring(0, 200) 
          }
        );
      }
    }

    // Düz metin yanıtı işleme
    console.log(`📝 Gateway: ${provider.toUpperCase()} düz metin yanıtı`);
    const payload = n8nResponse.ok
      ? { 
          success: true, 
          content: responseText,
          provider: provider,
          model_used: validatedModel,
          original_model: body.model || null,
          is_fallback: isFallback,
          files_processed: processedFiles.length,
          metadata: {
            contentType,
            status,
            response_time: new Date().toISOString()
          }
        }
      : {
          success: false,
          error: {
            message: responseText || n8nResponse.statusText || `${provider.toUpperCase()} error`,
            code: 'AI_ERROR',
            status,
            provider: provider,
          },
        };

    return new Response(JSON.stringify(payload), {
      status: n8nResponse.ok ? 200 : status,
      headers: { 
        'content-type': 'application/json',
        'x-ai-provider': provider,
        'x-model-used': validatedModel,
        'x-is-fallback': isFallback.toString(),
        'x-files-processed': processedFiles.length.toString()
      },
    });

  } catch (err: any) {
    console.error('💥 Gateway: Genel hata:', err);
    
    // AbortError (timeout) kontrolü
    if (err.name === 'AbortError') {
      return createErrorResponse(
        'AI sistemi zaman aşımına uğradı (2dk)', 
        'TIMEOUT', 
        504
      );
    }

    // Bağlantı hatası
    if (err.code === 'ECONNREFUSED') {
      return createErrorResponse(
        'n8n servisine bağlanılamıyor. n8n çalışır durumda mı?', 
        'CONNECTION_REFUSED', 
        502
      );
    }

    // Network hatası
    if (err.code === 'ENOTFOUND') {
      return createErrorResponse(
        'n8n sunucusu bulunamadı. URL doğru mu?', 
        'HOST_NOT_FOUND', 
        502
      );
    }

    // Genel hata
    return createErrorResponse(
      err?.message || 'Multi-AI Gateway hatası', 
      'GATEWAY_ERROR', 
      502,
      { 
        errorName: err?.name,
        errorCode: err?.code 
      }
    );
  }
}