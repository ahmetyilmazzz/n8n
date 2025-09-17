// src/lib/ai-config.ts
// Tüm AI modellerini, katman ikonlarını ve özel model yapılandırmalarını içerir.

import { AIModel } from './types';

export const AI_MODELS: AIModel[] = [
  // Claude modelleri (Anthropic)
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Yeni)', provider: 'claude', tier: 'flagship' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'claude', tier: 'fast' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'claude', tier: 'balanced' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'claude', tier: 'fast' },
  { id: 'claude-haiku-3.5', name: 'Claude Haiku 3.5', provider: 'claude', tier: 'fast' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'claude', tier: 'flagship' },
  { id: 'claude-opus-4', name: 'Claude Opus 4.x', provider: 'claude', tier: 'flagship' },
  { id: 'claude-sonnet-3.7', name: 'Claude Sonnet 3.7', provider: 'claude', tier: 'flagship' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'claude', tier: 'flagship' },
  
  // ChatGPT modelleri (OpenAI)
  { id: 'gpt-4o', name: 'GPT-4o (En Yeni)', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'chatgpt', tier: 'balanced' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-5', name: '🚀 GPT-5 (Beta)', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-5-mini', name: '⚡ GPT-5 Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-5-nano', name: '🔹 GPT-5 Nano', provider: 'chatgpt', tier: 'fast' },
  { id: 'o3-deep-research', name: '🧠 o3 Deep Research', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o3-pro', name: '💎 o3 Pro', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o3', name: '🔬 o3 (Reasoning)', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o4-mini-deep-research', name: '🔍 o4 Mini Deep Research', provider: 'chatgpt', tier: 'balanced' },
  { id: 'o4-mini', name: '⚡ o4 Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'o1-pro', name: '👑 o1 Pro', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o1-preview', name: '🔍 o1 Preview', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o1-mini', name: '⚡ o1 Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4.1', name: '🎯 GPT-4.1', provider: 'chatgpt', tier: 'balanced' },
  { id: 'gpt-4.1-mini', name: '🔹 GPT-4.1 Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4.1-nano', name: '💫 GPT-4.1 Nano', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4o-realtime', name: '🌐 GPT-4o Realtime', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-realtime', name: '🔴 GPT Realtime', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-audio', name: '🎵 GPT Audio', provider: 'chatgpt', tier: 'balanced' },
  { id: 'chatgpt-4o', name: '💬 ChatGPT-4o', provider: 'chatgpt', tier: 'flagship' },
  { id: 'babbage-002', name: '🔧 Babbage-002', provider: 'chatgpt', tier: 'legacy' },
  { id: 'davinci-002', name: '🎨 Davinci-002', provider: 'chatgpt', tier: 'legacy' },
  { id: 'codex-mini-latest', name: '💻 Codex Mini Latest', provider: 'chatgpt', tier: 'fast' },
  { id: 'dall-e-2', name: '🖼️ DALL-E 2', provider: 'chatgpt', tier: 'balanced' },
  { id: 'dall-e-3', name: '🎨 DALL-E 3', provider: 'chatgpt', tier: 'flagship' },

  // Gemini modelleri (Google)
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-1.5-pro-exp-0827', name: 'Gemini 1.5 Pro Experimental', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', tier: 'fast' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'gemini', tier: 'fast' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', provider: 'gemini', tier: 'balanced' },
  { id: 'gemini-2.5-pro', name: '💎 Gemini 2.5 Pro', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-2.5-flash', name: '⚡ Gemini 2.5 Flash', provider: 'gemini', tier: 'fast' },
  { id: 'gemini-2.5-flash-lite', name: '🔹 Gemini 2.5 Flash-Lite', provider: 'gemini', tier: 'fast' },
  { id: 'veo-3', name: '🎬 Veo 3 (Video)', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-2.5-flash-image', name: '🖼️ Gemini 2.5 Flash Image', provider: 'gemini', tier: 'balanced' },
  { id: 'gemini-embeddings', name: '🔗 Gemini Embeddings', provider: 'gemini', tier: 'balanced' },
];

export const TIER_ICONS: Record<NonNullable<AIModel['tier']>, string> = {
  flagship: '🚀',
  balanced: '⚖️',
  fast: '⚡',
  legacy: '📦'
};

export const SPECIAL_MODEL_CONFIGS: Record<string, any> = {
  'o1-preview': { maxTokens: 32768, temperature: 1.0, supportsSystemPrompt: false },
  'o1-mini': { maxTokens: 65536, temperature: 1.0, supportsSystemPrompt: false },
  'o1-pro': { maxTokens: 32768, temperature: 1.0, supportsSystemPrompt: false },
  'o3': { maxTokens: 40000, temperature: 1.0, supportsSystemPrompt: false },
  'o3-pro': { maxTokens: 50000, temperature: 1.0, supportsSystemPrompt: false },
  'o3-deep-research': { maxTokens: 60000, temperature: 1.0, supportsSystemPrompt: false },
  'o4-mini': { maxTokens: 32768, temperature: 1.0, supportsSystemPrompt: false },
  'o4-mini-deep-research': { maxTokens: 40000, temperature: 1.0, supportsSystemPrompt: false },
  'gpt-5': { maxTokens: 128000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-5-mini': { maxTokens: 64000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-5-nano': { maxTokens: 32000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-4.1': { maxTokens: 32000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-4.1-mini': { maxTokens: 16000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-4.1-nano': { maxTokens: 8000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-realtime': { maxTokens: 16000, temperature: 0.7, supportsRealtime: true },
  'gpt-4o-realtime': { maxTokens: 32000, temperature: 0.7, supportsRealtime: true },
  'gemini-2.5-pro': { maxTokens: 100000, temperature: 0.7, supportsMultimodal: true },
  'gemini-2.5-flash': { maxTokens: 50000, temperature: 0.7, supportsMultimodal: true },
  'veo-3': { maxTokens: 32000, temperature: 0.7, supportsVideo: true },
  'claude-sonnet-4-20250514': { maxTokens: 200000, temperature: 0.7, supportsSystemPrompt: true },
  'claude-opus-4': { maxTokens: 200000, temperature: 0.7, supportsSystemPrompt: true },
};