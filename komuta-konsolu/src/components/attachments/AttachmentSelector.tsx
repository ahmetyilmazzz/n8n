// src/components/attachments/AttachmentSelector.tsx
'use client';
import { useRef } from 'react';
import { UploadedFile } from '@/lib/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (files: UploadedFile[]) => void;
  onImagePaste: () => void;
};

export const AttachmentSelector = ({ isOpen, onClose, onFileUpload, onImagePaste }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null, isImage = false) => {
    if (!files) return;
    const newFiles: UploadedFile[] = [];
    
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Dosya çok büyük: ${file.name}. Maksimum 10MB.`);
        continue;
      }
      if (isImage && !file.type.startsWith('image/')) {
        alert(`Sadece resim dosyaları seçebilirsiniz: ${file.name}`);
        continue;
      }

      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name, type: file.type, size: file.size, data: fileData,
      });
    }

    if (newFiles.length > 0) {
      onFileUpload(newFiles);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="attachment-overlay" onClick={onClose}></div>
      <div className="attachment-menu">
        <div className="attachment-option" onClick={() => imageInputRef.current?.click()}>
          <div className="attachment-icon">🖼️</div>
          <div className="attachment-text"><div className="attachment-title">Resim ekle</div><div className="attachment-subtitle">Resim dosyalarını yükleyin</div></div>
        </div>
        <div className="attachment-option" onClick={() => fileInputRef.current?.click()}>
          <div className="attachment-icon">📎</div>
          <div className="attachment-text"><div className="attachment-title">Dosya yükle</div><div className="attachment-subtitle">Dokuman, PDF, vb.</div></div>
        </div>
        <div className="attachment-option" onClick={() => { onImagePaste(); onClose(); }}>
          <div className="attachment-icon">📸</div>
          <div className="attachment-text"><div className="attachment-title">Ekran görüntüsü yapıştır</div><div className="attachment-subtitle">Win+Shift+S ile alınan görüntü</div></div>
        </div>
      </div>
      <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileSelect(e.target.files, true)} style={{ display: 'none' }} />
      <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFileSelect(e.target.files, false)} style={{ display: 'none' }} accept="image/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.json" />
    </>
  );
};