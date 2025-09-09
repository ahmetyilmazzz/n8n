// app/api/ai-gateway/route.ts
// Ã‡oklu AI destekli n8n webhook proxy'si

export const dynamic = 'force-dynamic';

// AI Provider belirleme fonksiyonu
function detectAIProvider(model: string): string {
  if (model.includes('claude')) return 'claude';
  if (model.includes('gpt')) return 'chatgpt';
  if (model.includes('gemini')) return 'gemini';
  return 'claude'; // varsayÄ±lan
}

export async function POST(req: Request) {
  console.log('ðŸš€ Multi-AI Proxy: Ä°stek alÄ±ndÄ±');
  
  try {
    // Ä°stek gÃ¶vdesini al
    let body;
    try {
      body = await req.json();
      console.log('ðŸ“¤ Proxy: GÃ¶nderilen veri:', JSON.stringify(body, null, 2));
    } catch (err) {
      console.error('âŒ Proxy: Ä°stek gÃ¶vdesi JSON parse edilemedi:', err);
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'GeÃ§ersiz JSON formatÄ±', code: 'INVALID_JSON' }
        }),
        { 
          status: 400, 
          headers: { 'content-type': 'application/json' } 
        }
      );
    }

    // AI provider'Ä± belirle
    const aiProvider = detectAIProvider(body.model || '');
    console.log(`ðŸ¤– Tespit edilen AI Provider: ${aiProvider} (Model: ${body.model})`);

    // Body'ye provider bilgisini ekle (n8n switch iÃ§in)
    const enhancedBody = {
      ...body,
      ai_provider: aiProvider,
      timestamp: new Date().toISOString()
    };

    console.log('ðŸ“¡ Proxy: n8n webhook\'una istek gÃ¶nderiliyor...');
    console.log('ðŸ”„ Enhanced Body:', JSON.stringify(enhancedBody, null, 2));

    const n8nResponse = await fetch('http://localhost:5678/webhook/ai-gateway', {
      method: 'POST',
      headers: { 
        'content-type': 'application/json',
        'user-agent': 'komuta-konsolu-multi-ai-proxy/1.0',
        'x-ai-provider': aiProvider // Header olarak da gÃ¶nder
      },
      body: JSON.stringify(enhancedBody),
      signal: AbortSignal.timeout(45000) // 45 saniye timeout (AI'lar iÃ§in daha uzun)
    });

    const status = n8nResponse.status;
    const contentType = n8nResponse.headers.get('content-type') || '';
    
    console.log(`ðŸ“‹ Proxy: n8n yanÄ±t durumu: ${status} ${n8nResponse.statusText}`);
    console.log(`ðŸ“‹ Proxy: n8n content-type: ${contentType}`);

    // YanÄ±t metnini al
    let responseText: string;
    try {
      responseText = await n8nResponse.text();
      console.log('ðŸ“¥ Proxy: n8n ham yanÄ±tÄ±:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    } catch (err) {
      console.error('âŒ Proxy: n8n yanÄ±tÄ± okunamadÄ±:', err);
      return new Response(
        JSON.stringify({
          success: false,
          error: { 
            message: 'n8n yanÄ±tÄ± okunamadÄ±', 
            code: 'READ_ERROR',
            ai_provider: aiProvider
          }
        }),
        { 
          status: 502, 
          headers: { 'content-type': 'application/json' } 
        }
      );
    }

    // BoÅŸ yanÄ±t kontrolÃ¼
    if (!responseText.trim()) {
      console.warn('âš ï¸ Proxy: n8n boÅŸ yanÄ±t dÃ¶ndÃ¼');
      return new Response(
        JSON.stringify({
          success: false,
          error: { 
            message: `${aiProvider.toUpperCase()} sisteminden boÅŸ yanÄ±t`, 
            code: 'EMPTY_RESPONSE',
            ai_provider: aiProvider
          }
        }),
        { 
          status: 502, 
          headers: { 'content-type': 'application/json' } 
        }
      );
    }

    // JSON yanÄ±t kontrolÃ¼ ve iÅŸleme
    if (contentType.includes('application/json')) {
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log(`âœ… Proxy: ${aiProvider.toUpperCase()} JSON yanÄ±tÄ± baÅŸarÄ±yla parse edildi`);
        
        // AI provider bilgisini yanÄ±ta ekle
        if (jsonResponse.success && typeof jsonResponse === 'object') {
          jsonResponse.ai_provider = aiProvider;
          jsonResponse.model_used = body.model;
        }
        
        return new Response(JSON.stringify(jsonResponse), {
          status,
          headers: { 
            'content-type': 'application/json',
            'x-ai-provider': aiProvider
          },
        });
      } catch (parseErr) {
        console.error(`âŒ Proxy: ${aiProvider.toUpperCase()} JSON parse hatasÄ±:`, parseErr);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: { 
              message: `${aiProvider.toUpperCase()} geÃ§ersiz JSON dÃ¶ndÃ¼`, 
              code: 'INVALID_JSON_FROM_AI',
              ai_provider: aiProvider,
              details: responseText.substring(0, 200)
            }
          }),
          { 
            status: 502, 
            headers: { 'content-type': 'application/json' } 
          }
        );
      }
    }

    // JSON deÄŸilse dÃ¼z metin yanÄ±tÄ±
    console.log(`ðŸ“„ Proxy: ${aiProvider.toUpperCase()} dÃ¼z metin yanÄ±tÄ±`);
    const payload = n8nResponse.ok
      ? { 
          success: true, 
          content: responseText,
          ai_provider: aiProvider,
          model_used: body.model,
          metadata: {
            contentType,
            status
          }
        }
      : {
          success: false,
          error: {
            message: responseText || n8nResponse.statusText || `${aiProvider.toUpperCase()} error`,
            code: 'AI_ERROR',
            status,
            contentType,
            ai_provider: aiProvider,
          },
        };

    return new Response(JSON.stringify(payload), {
      status: n8nResponse.ok ? 200 : status,
      headers: { 
        'content-type': 'application/json',
        'x-ai-provider': aiProvider
      },
    });

  } catch (err: any) {
    console.error('ðŸ’¥ Proxy: Genel hata:', err);
    
    // Timeout hatasÄ± kontrolÃ¼
    if (err.name === 'TimeoutError') {
      return new Response(
        JSON.stringify({
          success: false,
          error: { 
            message: 'AI sistemi zaman aÅŸÄ±mÄ±na uÄŸradÄ± (45s)', 
            code: 'TIMEOUT',
            status: 504 
          },
        }),
        { 
          status: 504, 
          headers: { 'content-type': 'application/json' } 
        }
      );
    }

    // BaÄŸlantÄ± hatasÄ±
    if (err.code === 'ECONNREFUSED') {
      return new Response(
        JSON.stringify({
          success: false,
          error: { 
            message: 'n8n servisine baÄŸlanÄ±lamÄ±yor (ECONNREFUSED)', 
            code: 'CONNECTION_REFUSED',
            status: 502 
          },
        }),
        { 
          status: 502, 
          headers: { 'content-type': 'application/json' } 
        }
      );
    }

    // Genel hata
    return new Response(
      JSON.stringify({
        success: false,
        error: { 
          message: err?.message || 'Multi-AI Proxy hatasÄ±', 
          code: 'PROXY_ERROR',
          status: 502 
        },
      }),
      { 
        status: 502, 
        headers: { 'content-type': 'application/json' } 
      }
    );
  }
}