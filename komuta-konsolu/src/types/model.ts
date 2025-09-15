export type AIProvider = 'claude' | 'chatgpt' | 'gemini';

export type ModelTier = 'flagship' | 'balanced' | 'fast' | 'legacy';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  tier?: ModelTier;
}

export interface ModelConfig {
  maxTokens?: number;
  temperature?: number;
  supportsSystemPrompt?: boolean;
  supportsRealtime?: boolean;
  supportsMultimodal?: boolean;
  supportsVideo?: boolean;
}

export const TIER_ICONS: Record<ModelTier, string> = {
  flagship: '🚀',
  balanced: '⚖️',
  fast: '⚡',
  legacy: '📦',
};