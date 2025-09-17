// src/hooks/useFileManagement.ts
// Sadece yüklenen ve AI tarafından oluşturulan dosyaların durumunu yönetir.
'use client';

import { useState } from 'react';
import { detectFileType } from '@/lib/utils'; // Bu fonksiyonu daha önce oluşturmuştuk

// Tipleri merkezi bir yerden almak en iyisidir, örneğin: src/lib/types.ts
export interface UploadedFile {
  id: string; name: string; type: string; size: number; data: string;
}
export interface GeneratedFile {
  id: string; name: string; content: string; type: string; size: number; createdAt: Date;
}

export const useFileManagement = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);

  const handleFileUpload = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  const clearUploadedFiles = () => {
    setUploadedFiles([]);
  };

  const handleCodeDetected = (code: string, language: string, filename?: string) => {
    const newFile: GeneratedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: (filename || `generated-${Date.now()}`).replace(/\.[^/.]+$/, ""),
      content: code,
      type: detectFileType(code, language),
      size: new Blob([code]).size,
      createdAt: new Date(),
    };
    setGeneratedFiles(prev => [...prev, newFile]);
  };
  
  const resetFiles = () => {
    setUploadedFiles([]);
    setGeneratedFiles([]);
  };

  return {
    uploadedFiles,
    generatedFiles,
    handleFileUpload,
    handleRemoveFile,
    clearUploadedFiles,
    handleCodeDetected,
    resetFiles,
  };
};