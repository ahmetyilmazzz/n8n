// src/lib/ai-helpers.ts
// AI modelleri ile ilgili genel yardımcı fonksiyonları içerir.

export function detectProvider(model: string): string {
  if (model.includes('claude')) return 'claude';
  if (model.includes('gpt') || model.startsWith('o1') || model.startsWith('o3')) return 'chatgpt';
  if (model.includes('gemini') || model.includes('veo')) return 'gemini';
  return 'unknown';
}

export function getMaxTokensForModel(model: string): number {
  const modelLimits: Record<string, number> = {
    'gpt-4o': 4096, 'gpt-4-turbo': 4096, 'gpt-4': 4096,
    'gpt-3.5-turbo': 4096,
    'claude-3-5-sonnet-20241022': 4096, 'claude-3-opus-20240229': 4096,
    'claude-sonnet-4-20250514': 8192, 'claude-opus-4': 8192,
    'gemini-1.5-pro': 8192, 'gemini-1.5-flash': 8192, 'gemini-2.5-pro': 8192,
  };
  if (modelLimits[model]) return modelLimits[model];
  if (model.includes('claude')) return 4096;
  if (model.includes('gemini')) return 8192;
  return 4096;
}

export function getTemperatureForModel(model: string): number {
  if (model.startsWith('o1') || model.startsWith('o3')) return 1.0;
  return 0.7;
}