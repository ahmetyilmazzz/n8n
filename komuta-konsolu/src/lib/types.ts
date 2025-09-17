// src/lib/types.ts
// Proje genelinde kullanılacak TypeScript arayüzlerini ve tiplerini tanımlar.

export type AIProvider = 'claude' | 'chatgpt' | 'gemini';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  tier?: 'flagship' | 'balanced' | 'fast' | 'legacy';
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 data URL
}

export type GeneratedFileType = 'javascript' | 'typescript' | 'python' | 'css' | 'html' | 'json' | 'txt' | 'markdown' | 'xml' | 'sql' | 'yaml';

export interface GeneratedFile {
  id: string;
  name: string;
  content: string;
  type: GeneratedFileType;
  size: number;
  createdAt: Date;
}