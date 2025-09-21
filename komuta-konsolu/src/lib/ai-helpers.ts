// src/lib/file-helpers.ts
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface ProcessedFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  data: string; // Base64 encoded
  mimeType: string;
  extension: string;
  uploadedAt: Date;
  category: 'image' | 'video' | 'audio' | 'document' | 'code' | 'archive' | 'other';
  isText: boolean;
  preview?: string; // Text dosyalar için ilk birkaç satır
}

// Desteklenen dosya türleri ve boyut limitleri
export const FILE_CONFIG = {
  MAX_SIZE: {
    image: 10 * 1024 * 1024,    // 10MB
    video: 100 * 1024 * 1024,   // 100MB
    audio: 25 * 1024 * 1024,    // 25MB
    document: 25 * 1024 * 1024, // 25MB
    code: 5 * 1024 * 1024,      // 5MB
    archive: 50 * 1024 * 1024,  // 50MB
    other: 15 * 1024 * 1024     // 15MB
  },
  SUPPORTED_TYPES: {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico'],
    video: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v'],
    audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'],
    document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.odt'],
    code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kotlin', '.html', '.css', '.scss', '.less', '.json', '.xml', '.yaml', '.yml', '.sql', '.sh', '.bat'],
    archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
    other: ['.log', '.config', '.ini', '.env', '.md', '.readme']
  }
} as const;

export function getFileCategory(fileName: string): ProcessedFile['category'] {
  const extension = getFileExtension(fileName).toLowerCase();
  
  for (const [category, extensions] of Object.entries(FILE_CONFIG.SUPPORTED_TYPES)) {
    if (extensions.includes(extension)) {
      return category as ProcessedFile['category'];
    }
  }
  return 'other';
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot);
}

export function getMimeType(fileName: string): string {
  const extension = getFileExtension(fileName).toLowerCase();
  
  const mimeMap: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp', '.tiff': 'image/tiff', '.ico': 'image/x-icon',
    
    // Videos
    '.mp4': 'video/mp4', '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska',
    '.mov': 'video/quicktime', '.wmv': 'video/x-ms-wmv', '.flv': 'video/x-flv',
    '.webm': 'video/webm', '.m4v': 'video/x-m4v',
    
    // Audio
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.flac': 'audio/flac',
    '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
    '.wma': 'audio/x-ms-wma',
    
    // Documents
    '.pdf': 'application/pdf', '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain', '.rtf': 'application/rtf', '.odt': 'application/vnd.oasis.opendocument.text',
    
    // Code files
    '.js': 'text/javascript', '.ts': 'application/typescript', '.jsx': 'text/jsx',
    '.tsx': 'text/tsx', '.py': 'text/x-python', '.java': 'text/x-java-source',
    '.c': 'text/x-c', '.cpp': 'text/x-c++', '.cs': 'text/x-csharp',
    '.php': 'text/x-php', '.rb': 'text/x-ruby', '.go': 'text/x-go',
    '.rs': 'text/x-rust', '.swift': 'text/x-swift', '.kotlin': 'text/x-kotlin',
    '.html': 'text/html', '.css': 'text/css', '.scss': 'text/x-scss',
    '.less': 'text/x-less', '.json': 'application/json', '.xml': 'application/xml',
    '.yaml': 'application/x-yaml', '.yml': 'application/x-yaml',
    '.sql': 'application/sql', '.sh': 'application/x-sh', '.bat': 'application/x-bat',
    
    // Archives
    '.zip': 'application/zip', '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed', '.tar': 'application/x-tar',
    '.gz': 'application/gzip', '.bz2': 'application/x-bzip2',
    
    // Other
    '.log': 'text/plain', '.config': 'text/plain', '.ini': 'text/plain',
    '.env': 'text/plain', '.md': 'text/markdown', '.readme': 'text/plain'
  };
  
  return mimeMap[extension] || 'application/octet-stream';
}

export function isTextFile(fileName: string): boolean {
  const mimeType = getMimeType(fileName);
  const textMimeTypes = [
    'text/', 'application/json', 'application/xml', 'application/javascript',
    'application/typescript', 'application/x-yaml', 'application/sql'
  ];
  
  return textMimeTypes.some(type => mimeType.startsWith(type));
}

export function validateFile(file: File): FileValidationResult {
  const warnings: string[] = [];
  const category = getFileCategory(file.name);
  const maxSize = FILE_CONFIG.MAX_SIZE[category];
  
  // Boyut kontrolü
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Dosya çok büyük (${formatFileSize(file.size)}). ${category} dosyaları için maksimum boyut: ${formatFileSize(maxSize)}`
    };
  }
  
  // Boş dosya kontrolü
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Boş dosya yüklenemez'
    };
  }
  
  // Dosya adı kontrolü
  if (!file.name || file.name.trim() === '') {
    return {
      isValid: false,
      error: 'Geçersiz dosya adı'
    };
  }
  
  // Güvenlik kontrolü - tehlikeli uzantılar
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js'];
  const extension = getFileExtension(file.name).toLowerCase();
  
  if (dangerousExtensions.includes(extension)) {
    warnings.push(`${extension} uzantılı dosyalar potansiyel güvenlik riski taşıyabilir`);
  }
  
  // Büyük dosya uyarısı
  if (file.size > 10 * 1024 * 1024) { // 10MB üzeri
    warnings.push('Büyük dosyalar yükleme süresini uzatabilir');
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(category: ProcessedFile['category'], fileName?: string): string {
  const extension = fileName ? getFileExtension(fileName).toLowerCase() : '';
  
  // Spesifik uzantılar için özel ikonlar
  const specificIcons: Record<string, string> = {
    '.pdf': '📄', '.doc': '📝', '.docx': '📝', '.xls': '📊', '.xlsx': '📊',
    '.ppt': '📊', '.pptx': '📊', '.txt': '📄', '.md': '📝',
    '.js': '⚡', '.ts': '🔷', '.jsx': '⚛️', '.tsx': '⚛️',
    '.py': '🐍', '.java': '☕', '.c': '🔧', '.cpp': '🔧',
    '.html': '🌐', '.css': '🎨', '.json': '📋', '.xml': '📄',
    '.zip': '📦', '.rar': '📦', '.7z': '📦',
    '.mp3': '🎵', '.wav': '🎵', '.mp4': '🎬', '.avi': '🎬',
    '.jpg': '🖼️', '.png': '🖼️', '.gif': '🖼️'
  };
  
  if (extension && specificIcons[extension]) {
    return specificIcons[extension];
  }
  
  // Kategori bazlı ikonlar
  const categoryIcons = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    document: '📄',
    code: '💻',
    archive: '📦',
    other: '📎'
  };
  
  return categoryIcons[category];
}

export async function processFile(file: File): Promise<ProcessedFile> {
  // Validasyon
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Dosyayı base64'e çevir
  const base64Data = await fileToBase64(file);
  
  const category = getFileCategory(file.name);
  const mimeType = getMimeType(file.name);
  const extension = getFileExtension(file.name);
  const isText = isTextFile(file.name);
  
  let preview: string | undefined;
  
  // Text dosyalar için önizleme oluştur
  if (isText && file.size < 1024 * 1024) { // 1MB altı text dosyalar için
    try {
      const text = await file.text();
      const lines = text.split('\n').slice(0, 10); // İlk 10 satır
      preview = lines.join('\n');
      if (text.split('\n').length > 10) {
        preview += '\n... (devamı var)';
      }
    } catch (error) {
      console.warn('Preview oluşturulamadı:', error);
    }
  }
  
  return {
    id: generateFileId(),
    name: file.name.replace(/[^a-zA-Z0-9.-_]/g, '_'), // Güvenli dosya adı
    originalName: file.name,
    type: file.type || mimeType,
    size: file.size,
    data: base64Data,
    mimeType,
    extension,
    uploadedAt: new Date(),
    category,
    isText,
    preview
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Dosya okuma hatası'));
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export function downloadFile(processedFile: ProcessedFile): void {
  try {
    const blob = base64ToBlob(processedFile.data, processedFile.mimeType);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = processedFile.originalName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Dosya indirme hatası:', error);
    throw new Error('Dosya indirilemedi');
  }
}

function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createFileFromAIResponse(
  content: string,
  fileName: string,
  mimeType?: string
): ProcessedFile {
  const blob = new Blob([content], { type: mimeType || 'text/plain' });
  const size = blob.size;
  const reader = new FileReader();
  
  return new Promise<ProcessedFile>((resolve) => {
    reader.onload = () => {
      const base64Data = reader.result as string;
      const extension = getFileExtension(fileName);
      const category = getFileCategory(fileName);
      
      resolve({
        id: generateFileId(),
        name: fileName,
        originalName: fileName,
        type: mimeType || getMimeType(fileName),
        size,
        data: base64Data,
        mimeType: mimeType || getMimeType(fileName),
        extension,
        uploadedAt: new Date(),
        category,
        isText: isTextFile(fileName),
        preview: category === 'code' || isTextFile(fileName) 
          ? content.split('\n').slice(0, 10).join('\n') 
          : undefined
      });
    };
    reader.readAsDataURL(blob);
  }) as any; // TypeScript workaround
}

// Özel dosya işleme fonksiyonları
export class FileProcessor {
  static async extractTextFromFile(file: ProcessedFile): Promise<string | null> {
    if (!file.isText) return null;
    
    try {
      const blob = base64ToBlob(file.data, file.mimeType);
      return await blob.text();
    } catch (error) {
      console.error('Text extraction error:', error);
      return null;
    }
  }
  
  static async createThumbnail(file: ProcessedFile): Promise<string | null> {
    if (file.category !== 'image') return null;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxSize = 150;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(null);
      img.src = file.data;
    });
  }
}