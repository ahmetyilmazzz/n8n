// src/lib/utils.ts
// Proje genelinde kullanılacak yardımcı fonksiyonları barındırır.

import { GeneratedFileType } from './types';

export const detectFileType = (content: string, language?: string): GeneratedFileType => {
  if (language) {
    const langMap: Record<string, GeneratedFileType> = {
      'javascript': 'javascript', 'js': 'javascript', 'typescript': 'typescript', 'ts': 'typescript',
      'python': 'python', 'py': 'python', 'css': 'css', 'html': 'html', 'json': 'json',
      'markdown': 'markdown', 'md': 'markdown', 'xml': 'xml', 'sql': 'sql', 'yaml': 'yaml', 'yml': 'yaml'
    };
    if (langMap[language.toLowerCase()]) {
      return langMap[language.toLowerCase()];
    }
  }

  if (content.includes('import React') || content.includes('export default')) return 'typescript';
  if (content.includes('def ') && content.includes('import ')) return 'python';
  if (content.includes('<html') || content.includes('<!DOCTYPE')) return 'html';
  if (content.trim().startsWith('{') && content.trim().endsWith('}')) return 'json';
  if (content.includes('SELECT') && content.includes('FROM')) return 'sql';
  if (content.trim().startsWith('---') && content.includes(':')) return 'yaml';
  
  return 'txt';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};