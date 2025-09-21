// src/lib/file-helpers.ts
import { ProcessedFile } from './types';

// Maksimum dosya boyutları (bytes)
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 25 * 1024 * 1024, // 25MB
  document: 25 * 1024 * 1024, // 25MB
  code: 5 * 1024 * 1024, // 5MB
  other: 25 * 1024 * 1024, // 25MB
};

// Desteklenen dosya türleri
export const SUPPORTED_EXTENSIONS = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff', '.ico'],
  video: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.ogv'],
  audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.opus', '.aiff', '.au'],
  document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.odt', '.ods', '.odp', '.csv', '.tsv', '.json', '.xml', '.yaml', '.yml'],
  code: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.scala', '.clj', '.hs', '.elm', '.ml', '.fs', '.vb', '.pl', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd', '.sql', '.r', '.m', '.mm', '.s', '.asm', '.nasm', '.v', '.sv', '.vhd', '.vhdl', '.tcl', '.lua', '.nim', '.zig', '.d', '.cr', '.ex', '.exs', '.erl', '.hrl', '.f', '.f90', '.f95', '.f03', '.f08', '.for', '.ftn', '.pas', '.pp', '.inc', '.cfg', '.conf', '.ini', '.toml', '.properties', '.env', '.dockerfile', '.makefile', '.cmake', '.gradle', '.sbt', '.pom', '.gemfile', '.podfile', '.package', '.lock', '.mod', '.sum']
};

// Dosya kategorisini belirle
export function getFileCategory(fileName: string, mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'code' | 'other' {
  const extension = '.' + fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType.startsWith('image/') || SUPPORTED_EXTENSIONS.image.includes(extension)) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || SUPPORTED_EXTENSIONS.video.includes(extension)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || SUPPORTED_EXTENSIONS.audio.includes(extension)) {
    return 'audio';
  }
  if (SUPPORTED_EXTENSIONS.document.includes(extension) || 
      mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('spreadsheet')) {
    return 'document';
  }
  if (SUPPORTED_EXTENSIONS.code.includes(extension) || 
      mimeType.startsWith('text/') && !mimeType.includes('plain')) {
    return 'code';
  }
  
  return 'other';
}

// Dosya validasyonu
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export function validateFile(file: File): ValidationResult {
  const category = getFileCategory(file.name, file.type);
  const maxSize = MAX_FILE_SIZES[category];
  const warnings: string[] = [];
  
  // Boyut kontrolü
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Dosya çok büyük. Maksimum ${formatFileSize(maxSize)} olmalı.`
    };
  }
  
  // Minimum boyut kontrolü
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Dosya boş görünüyor.'
    };
  }
  
  // Uzantı kontrolü
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const allSupportedExtensions = Object.values(SUPPORTED_EXTENSIONS).flat();
  
  if (!allSupportedExtensions.includes(extension) && !file.type.startsWith('text/')) {
    warnings.push('Bu dosya türü tam olarak desteklenmeyebilir.');
  }
  
  // Çok büyük dosya uyarısı
  if (file.size > 5 * 1024 * 1024) {
    warnings.push('Büyük dosyalar yükleme süresi uzun olabilir.');
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Dosyayı işle ve base64'e çevir
export async function processFile(file: File): Promise<ProcessedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      resolve({
        id: generateFileId(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: result, // Base64 data URL
        category: getFileCategory(file.name, file.type),
        lastModified: file.lastModified,
        webkitRelativePath: (file as any).webkitRelativePath
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Dosya ID üret
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Dosya boyutunu formatla
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Dosya ikonunu al
export function getFileIcon(type: string, category?: string): string {
  if (category === 'image' || type.startsWith('image/')) return '🖼️';
  if (category === 'video' || type.startsWith('video/')) return '🎬';
  if (category === 'audio' || type.startsWith('audio/')) return '🎵';
  if (category === 'code' || isCodeFile(type)) return '💻';
  if (type.includes('pdf')) return '📕';
  if (type.includes('word') || type.includes('document')) return '📘';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
  if (type.startsWith('text/')) return '📄';
  
  return '📎';
}

// Kod dosyası kontrolü
function isCodeFile(type: string): boolean {
  const codeTypes = [
    'text/javascript', 'application/javascript',
    'text/typescript', 'application/typescript',
    'text/x-python', 'application/x-python',
    'text/html', 'application/json',
    'text/css', 'text/xml'
  ];
  
  return codeTypes.some(codeType => type.includes(codeType));
}

// Base64'den blob oluştur
export function base64ToBlob(base64Data: string, mimeType: string): Blob {
  const base64 = base64Data.split(',')[1] || base64Data;
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);
  
  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }
  
  return new Blob([array], { type: mimeType });
}

// Dosyayı indir
export function downloadFile(file: ProcessedFile): void {
  const blob = base64ToBlob(file.data, file.type);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}