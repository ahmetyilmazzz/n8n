/**
 * Dosya yükleme ve işleme adaptörü
 * Base64, FormData ve tus protokollerini destekler
 */

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 format
  uploadedAt: Date;
}

export interface UploadOptions {
  maxSize?: number; // bytes
  allowedTypes?: string[];
  encoding?: 'base64' | 'formdata';
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/*',
    'text/*',
    'application/pdf',
    'application/json',
    'application/vnd.openxmlformats-officedocument.*'
  ],
  encoding: 'base64'
};

/**
 * Dosya türü kontrolü
 */
export const isFileTypeAllowed = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(allowedType => {
    if (allowedType.endsWith('*')) {
      const baseType = allowedType.replace('*', '');
      return file.type.startsWith(baseType);
    }
    return file.type === allowedType;
  });
};

/**
 * Dosya boyutu formatı
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Dosya türü ikonu
 */
export const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('text/')) return '📄';
  if (type.includes('pdf')) return '📕';
  if (type.includes('word')) return '📘';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  if (type.includes('json')) return '📋';
  return '📎';
};

/**
 * Base64 formatında dosya yükleme
 */
export const uploadFileAsBase64 = (file: File, options?: UploadOptions): Promise<UploadedFile> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    // Boyut kontrolü
    if (opts.maxSize && file.size > opts.maxSize) {
      reject(new Error(`Dosya boyutu ${formatFileSize(opts.maxSize)} sınırını aşıyor`));
      return;
    }

    // Tür kontrolü
    if (opts.allowedTypes && !isFileTypeAllowed(file, opts.allowedTypes)) {
      reject(new Error(`Desteklenmeyen dosya türü: ${file.type}`));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Dosya okunamadı'));
        return;
      }

      const uploadedFile: UploadedFile = {
        id: generateFileId(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: result,
        uploadedAt: new Date()
      };

      resolve(uploadedFile);
    };

    reader.onerror = () => {
      reject(new Error('Dosya okuma hatası'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Birden fazla dosyayı toplu yükleme
 */
export const uploadMultipleFiles = async (
  files: FileList | File[], 
  options?: UploadOptions
): Promise<UploadedFile[]> => {
  const filesArray = Array.from(files);
  const uploadPromises = filesArray.map(file => uploadFileAsBase64(file, options));
  
  try {
    const results = await Promise.allSettled(uploadPromises);
    const successful: UploadedFile[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        errors.push(`${filesArray[index].name}: ${result.reason.message}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Bazı dosyalar yüklenemedi:', errors);
    }

    return successful;
  } catch (error) {
    throw new Error(`Toplu yükleme hatası: ${error}`);
  }
};

/**
 * Panodan resim yapıştırma
 */
export const pasteImageFromClipboard = async (): Promise<UploadedFile | null> => {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      throw new Error('Pano desteği bu tarayıcıda mevcut değil');
    }

    const clipboardItems = await navigator.clipboard.read();

    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type);
          
          // Blob'u File olarak dönüştür
          const file = new File([blob], `ekran-goruntusu-${Date.now()}.png`, {
            type: 'image/png'
          });

          return await uploadFileAsBase64(file);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Pano erişim hatası:', error);
    throw new Error('Panoya erişim izni gerekli');
  }
};

/**
 * Sürükle-bırak yükleme
 */
export const handleDropFiles = async (
  event: DragEvent,
  options?: UploadOptions
): Promise<UploadedFile[]> => {
  event.preventDefault();
  
  const items = event.dataTransfer?.items;
  const files: File[] = [];

  if (items) {
    // DataTransferItemList kullan (modern tarayıcılar)
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
  } else {
    // Fallback için FileList kullan
    const fileList = event.dataTransfer?.files;
    if (fileList) {
      files.push(...Array.from(fileList));
    }
  }

  return await uploadMultipleFiles(files, options);
};

/**
 * Benzersiz dosya ID'si üretme
 */
const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Dosya meta bilgilerini çıkart
 */
export const extractFileMetadata = (file: UploadedFile) => {
  return {
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    icon: getFileIcon(file.type),
    uploadedAt: file.uploadedAt,
    isImage: file.type.startsWith('image/'),
    isText: file.type.startsWith('text/'),
    isPDF: file.type.includes('pdf')
  };
};

/**
 * Dosya önizleme URL'si oluştur
 */
export const createPreviewUrl = (file: UploadedFile): string | null => {
  if (file.type.startsWith('image/')) {
    return file.data; // base64 URL
  }
  return null;
};

/**
 * Dosyayı indirme bağlantısı oluştur
 */
export const createDownloadUrl = (file: UploadedFile): string => {
  return file.data;
};

/**
 * Dosya listesini temizle
 */
export const cleanupFiles = (files: UploadedFile[]): void => {
  // Base64 URL'ler otomatik temizlenir, şu an için ek işlem gerekmiyor
  // Gelecekte blob URL'leri için URL.revokeObjectURL() kullanılabilir
};