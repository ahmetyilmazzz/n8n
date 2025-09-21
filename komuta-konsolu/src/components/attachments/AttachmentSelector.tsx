// src/components/attachments/AttachmentSelector.tsx
'use client';
import { useRef, useState } from 'react';
import { processFile, validateFile } from '@/lib/file-helpers';
import type { ProcessedFile } from '@/lib/file-helpers';
import { useCallback, useMemo } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (files: ProcessedFile[]) => void;
  onImagePaste: () => void;
  maxFiles?: number;
  disabled?: boolean;
  acceptedFileTypes?: string[];
  showProgress?: boolean;
  onDragStateChange?: (isDragging: boolean) => void;
  maxFileSize?: number; // bytes
};

export const AttachmentSelector = (props: Props) => {
  const { 
    isOpen, 
    onClose, 
    onFileUpload, 
    onImagePaste,
    maxFiles = 10,
    disabled = false
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const validateFileSize = (file: File) => {
    const maxSize = props.maxFileSize || 100 * 1024 * 1024; // 100MB default
    if (file.size > maxSize) {
      throw new Error(`Dosya boyutu çok büyük. Maksimum: ${formatFileSize(maxSize)}`);
    }
  };

  const handleFileSelect = async (files: FileList | null, category?: string) => {
    if (!files || disabled || isProcessing) return;
    
    setIsProcessing(true);
    const processedFiles: ProcessedFile[] = [];
    const errors: string[] = [];
    
    try {
      const fileArray = Array.from(files).slice(0, maxFiles);
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileId = `temp_${i}_${Date.now()}`;
        
        try {
          // İlk validasyon
          const validation = validateFile(file);
          if (!validation.isValid) {
            errors.push(`${file.name}: ${validation.error}`);
            continue;
          }

          // Boyut validasyonu
          validateFileSize(file);
          
          // Uyarıları göster
          if (validation.warnings) {
            validation.warnings.forEach(warning => {
              console.warn(`${file.name}: ${warning}`);
            });
          }
          
          // Progress tracking
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
          
          // Dosyayı işle
          const processedFile = await processFile(file);
          
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          processedFiles.push(processedFile);
          
        } catch (error) {
          console.error(`Dosya işleme hatası (${file.name}):`, error);
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
      }
      
      // Başarılı dosyalar varsa callback'i çağır
      if (processedFiles.length > 0) {
        onFileUpload(processedFiles);
      }
      
      // Hataları göster
      if (errors.length > 0) {
        const errorMessage = `Bazı dosyalar yüklenemedi:\n${errors.join('\n')}`;
        alert(errorMessage);
      }
      
      // Başarılı yükleme mesajı
      if (processedFiles.length > 0) {
        console.log(`✅ ${processedFiles.length} dosya başarıyla yüklendi`);
      }
      
    } catch (error) {
      console.error('Genel dosya yükleme hatası:', error);
      alert('Dosya yükleme sırasında bir hata oluştu');
    } finally {
      setIsProcessing(false);
      setUploadProgress({});
      onClose();
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
      props.onDragStateChange?.(true);
    }
  }, [isDragging, props]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
    props.onDragStateChange?.(true);
  }, [props]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
        props.onDragStateChange?.(false);
      }
      return newCounter;
    });
  }, [props]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    props.onDragStateChange?.(false);
    
    if (disabled || isProcessing) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, isProcessing, handleFileSelect, props]);

  const fileCategories = useMemo(() => [
    {
      id: 'image',
      icon: '🖼️',
      title: 'Resim Ekle',
      description: 'JPG, PNG, GIF, WebP, SVG',
      accept: 'image/*,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.tiff,.ico',
      ref: imageInputRef
    },
    {
      id: 'video',
      icon: '🎬',
      title: 'Video Ekle', 
      description: 'MP4, AVI, MKV, MOV, WebM',
      accept: 'video/*,.mp4,.avi,.mkv,.mov,.wmv,.flv,.webm,.m4v,.3gp,.ogv',
      ref: videoInputRef
    },
    // ... diğer kategoriler
  ], []);

  if (!isOpen) {
    return (
      <ErrorBoundary>
        {null}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200"
          onClick={onClose}
        />
        
        {/* Main Menu */}
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-300">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dosya Ekle
              </h3>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {isProcessing && (
              <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                Dosyalar işleniyor...
              </div>
            )}
          </div>

          {/* File Options */}
          <div className="p-2 space-y-1">
            {/* Images */}
            <div 
              className="attachment-option flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => !disabled && imageInputRef.current?.click()}
            >
              <div className="text-2xl">🖼️</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Resim Ekle
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  JPG, PNG, GIF, WebP, SVG
                </div>
              </div>
            </div>

            {/* Videos */}
            <div 
              className="attachment-option flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => !disabled && videoInputRef.current?.click()}
            >
              <div className="text-2xl">🎬</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Video Ekle
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  MP4, AVI, MKV, MOV, WebM
                </div>
              </div>
            </div>

            {/* Audio */}
            <div 
              className="attachment-option flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => !disabled && audioInputRef.current?.click()}
            >
              <div className="text-2xl">🎵</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Ses Ekle
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  MP3, WAV, FLAC, AAC, OGG
                </div>
              </div>
            </div>

            {/* Documents */}
            <div 
              className="attachment-option flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => !disabled && documentInputRef.current?.click()}
            >
              <div className="text-2xl">📄</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Doküman Ekle
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  PDF, DOC, XLS, PPT, TXT
                </div>
              </div>
            </div>

            {/* Code Files */}
            <div 
              className="attachment-option flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => !disabled && codeInputRef.current?.click()}
            >
              <div className="text-2xl">💻</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Kod Dosyası Ekle
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  JS, TS, PY, C, Java, PHP
                </div>
              </div>
            </div>

            {/* All Files */}
            <div 
              className="attachment-option flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <div className="text-2xl">📎</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Herhangi Bir Dosya
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tüm dosya türleri
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Screenshot Paste */}
            <div 
              className="attachment-option flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => { 
                if (!disabled) {
                  onImagePaste(); 
                  onClose(); 
                }
              }}
            >
              <div className="text-2xl">📸</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Ekran Görüntüsü Yapıştır
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Win+Shift+S ile alınan görüntü
                </div>
              </div>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            className={`m-2 p-4 border-2 border-dashed rounded-lg text-center transition-all duration-200 ${
              isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={`text-gray-600 dark:text-gray-400 transition-all duration-200 ${isDragging ? 'scale-105' : ''}`}>
              <div className="text-3xl mb-2">{isDragging ? '📥' : '📋'}</div>
              <div className="text-sm font-medium">
                {isDragging ? 'Dosyaları bırakın' : 'Dosyaları buraya sürükleyip bırakın'}
              </div>
              {!isDragging && (
                <div className="text-xs mt-1 text-gray-500">
                  Maksimum {maxFiles} dosya
                </div>
              )}
            </div>
          </div>

          {/* Progress Bars */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            accept="*/*"
            disabled={disabled || isProcessing}
          />

          <input
            ref={imageInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files, 'image')}
            className="hidden"
            accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.tiff,.ico"
            disabled={disabled || isProcessing}
          />

          <input
            ref={videoInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files, 'video')}
            className="hidden"
            accept="video/*,.mp4,.avi,.mkv,.mov,.wmv,.flv,.webm,.m4v,.3gp,.ogv"
            disabled={disabled || isProcessing}
          />

          <input
            ref={audioInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files, 'audio')}
            className="hidden"
            accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.wma,.m4a,.opus,.aiff,.au"
            disabled={disabled || isProcessing}
          />

          <input
            ref={documentInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files, 'document')}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp,.csv,.tsv,.json,.xml,.yaml,.yml"
            disabled={disabled || isProcessing}
          />

          <input
            ref={codeInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files, 'code')}
            className="hidden"
            accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.dart,.scala,.clj,.hs,.elm,.ml,.fs,.vb,.pl,.sh,.bash,.zsh,.fish,.ps1,.bat,.cmd,.sql,.r,.m,.mm,.s,.asm,.nasm,.v,.sv,.vhd,.vhdl,.tcl,.lua,.nim,.zig,.d,.cr,.ex,.exs,.erl,.hrl,.f,.f90,.f95,.f03,.f08,.for,.ftn,.pas,.pp,.inc,.asm,.s,.S,.cfg,.conf,.ini,.toml,.properties,.env,.dockerfile,.makefile,.cmake,.gradle,.sbt,.pom,.gemfile,.podfile,.package,.lock,.mod,.sum"
            disabled={disabled || isProcessing}
          />
        </div>
      </>
    </ErrorBoundary>
  );
};
