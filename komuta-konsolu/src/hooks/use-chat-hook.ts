import { useState, useCallback, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  timestamp?: number;
}

interface ChatRequest {
  model: string;
  prompt: string;
  conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface ChatSuccessResponse {
  success: true; 
  role?: 'assistant';
  content: string; 
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  requestId?: string;
  rawResponse?: any; 
}

interface ChatErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

type ChatResponse = ChatSuccessResponse | ChatErrorResponse;

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  data: ChatSuccessResponse | null;
  sendMessage: (prompt: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  deleteMessage: (id: string) => void;
  resetChat: () => void;
}

interface UseChatConfig {
  model?: string;
  apiUrl?: string;
  timeout?: number;
  maxRetries?: number;
  onSuccess?: (r: ChatSuccessResponse) => void;
  onError?: (m: string) => void;
}

export function useChat(config: UseChatConfig = {}): UseChatReturn {
  const {
    model = 'claude-3-haiku-20240307',
    apiUrl = '/api/ai-gateway',
    timeout = 60_000, // 60 saniyeye Ã§Ä±karÄ±ldÄ±
    maxRetries = 2,
    onSuccess,
    onError,
  } = config;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChatSuccessResponse | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const generateId = useCallback(
    () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const fetchWithRetry = useCallback(
    async (url: string, options: RequestInit, retriesLeft: number): Promise<Response> => {
      try {
        console.log(`ðŸš€ API Ã§aÄŸrÄ±sÄ± yapÄ±lÄ±yor: ${url}`, { retriesLeft });
        const res = await fetch(url, options);
        
        console.log(`ðŸ“¡ YanÄ±t alÄ±ndÄ±: ${res.status} ${res.statusText}`);
        
        if (!res.ok && retriesLeft > 0) {
          console.warn(`âš ï¸ BaÅŸarÄ±sÄ±z istek, yeniden deneniyor... (${retriesLeft} deneme kaldÄ±)`);
          retryCountRef.current++;
          await new Promise(r => setTimeout(r, 1000 * retryCountRef.current));
          return fetchWithRetry(url, options, retriesLeft - 1);
        }
        return res;
      } catch (err: any) {
        console.error(`âŒ Fetch hatasÄ±:`, err);
        if (retriesLeft > 0 && !(err instanceof DOMException && err.name === 'AbortError')) {
          console.warn(`ðŸ”„ Yeniden deneniyor... (${retriesLeft} deneme kaldÄ±)`);
          retryCountRef.current++;
          await new Promise(r => setTimeout(r, 1000 * retryCountRef.current));
          return fetchWithRetry(url, options, retriesLeft - 1);
        }
        throw err;
      }
    },
    []
  );

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      const m = 'Mesaj boÅŸ olamaz';
      setError(m); 
      onError?.(m); 
      return;
    }

    // Ã–nceki isteÄŸi iptal et
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    retryCountRef.current = 0;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = { 
      role: 'user', 
      content: prompt, 
      id: generateId(), 
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const body: ChatRequest = {
        model,
        prompt,
        conversation_history: messages.map(({ role, content }) => ({ role, content })),
      };

      console.log('ðŸ“¤ GÃ¶nderilen veri:', JSON.stringify(body, null, 2));

      const timeoutId = setTimeout(() => {
        console.warn('â° Timeout gerÃ§ekleÅŸti');
        abortControllerRef.current?.abort();
      }, timeout);

      const res = await fetchWithRetry(
        apiUrl,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        },
        maxRetries
      );

      clearTimeout(timeoutId);

      // YanÄ±tÄ± detaylÄ± ÅŸekilde iÅŸle
      const contentType = res.headers.get('content-type') || '';
      console.log(`ðŸ“‹ Content-Type: ${contentType}`);

      let raw: string;
      try {
        raw = await res.text();
        console.log('ðŸ“¥ Ham yanÄ±t:', raw);
      } catch (textErr) {
        console.error('âŒ YanÄ±t metin olarak okunamadÄ±:', textErr);
        throw new Error('YanÄ±t okunamadÄ±');
      }

      if (!raw.trim()) {
        throw new Error('BoÅŸ yanÄ±t alÄ±ndÄ±');
      }

      let parsed: ChatResponse;
      try {
        parsed = JSON.parse(raw) as ChatResponse;
        console.log('âœ… JSON parse edildi:', parsed);
      } catch (parseErr) {
        console.error('âŒ JSON parse hatasÄ±:', parseErr);
        console.error('ðŸ” Parse edilemeyen veri:', raw.substring(0, 200) + '...');
        
        // JSON parse edilemezse, hata mesajÄ± olarak gÃ¶ster
        parsed = { 
          success: false, 
          error: { 
            message: `GeÃ§ersiz yanÄ±t formatÄ±: ${raw.substring(0, 100)}...`,
            code: 'PARSE_ERROR'
          } 
        };
      }

      if (parsed.success) {
        const assistant: Message = {
          role: 'assistant',
          content: parsed.content,
          id: generateId(),
          timestamp: Date.now(),
        };
        
        console.log('âœ… BaÅŸarÄ±lÄ± yanÄ±t alÄ±ndÄ±');
        setMessages(prev => [...prev, assistant]);
        setData(parsed);
        onSuccess?.(parsed);
      } else {
        const errorMsg = parsed.error?.message || 'Bilinmeyen bir hata oluÅŸtu';
        console.error('âŒ API hatasÄ±:', parsed.error);
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      console.error('ðŸ’¥ Genel hata:', err);
      
      const errorMessage = err?.name === 'AbortError'
        ? (timeout ? 'Ä°stek zaman aÅŸÄ±mÄ±na uÄŸradÄ±' : 'Ä°stek iptal edildi')
        : err?.message || 'Bir hata oluÅŸtu';
        
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, model, apiUrl, timeout, maxRetries, generateId, fetchWithRetry, onSuccess, onError]);

  const clearMessages = useCallback(() => { 
    setMessages([]); 
    setData(null); 
    setError(null);
  }, []);
  
  const clearError = useCallback(() => setError(null), []);
  
  const deleteMessage = useCallback((id: string) => 
    setMessages(prev => prev.filter(m => m.id !== id)), []
  );
  
  const resetChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]); 
    setIsLoading(false); 
    setError(null); 
    setData(null);
    abortControllerRef.current = null; 
    retryCountRef.current = 0;
  }, []);

  return { 
    messages, 
    isLoading, 
    error, 
    data, 
    sendMessage, 
    clearMessages, 
    clearError, 
    deleteMessage, 
    resetChat 
  };
}