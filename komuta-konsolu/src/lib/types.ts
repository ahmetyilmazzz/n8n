// src/lib/types.ts - Güncellenmiş versiyon

export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded data
  category?: 'image' | 'video' | 'audio' | 'document' | 'code' | 'other';
  lastModified?: number;
  webkitRelativePath?: string;
}

export interface UploadedFile extends ProcessedFile {
  uploadedAt?: Date;
}

export interface GeneratedFile {
  id: string;
  name: string;
  content: string;
  type: 'javascript' | 'typescript' | 'python' | 'css' | 'html' | 'json' | 'txt' | 'markdown' | 'xml' | 'sql' | 'yaml' | 'other';
  size: number;
  createdAt: Date;
  downloadUrl?: string;
}

// AI Response'dan gelen dosya formatı
export interface AIGeneratedFile {
  filename: string;
  content: string;
  language: string;
  type: string;
}