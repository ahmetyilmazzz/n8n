'use client';

import { useState, useRef } from 'react';

interface AttachmentButtonProps {
  onFileUpload: (files: FileList) => void;
  onPasteImage: () => void;
  disabled?: boolean;
}

export function AttachmentButton({
  onFileUpload,
  onPasteImage,
  disabled = false
}: AttachmentButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFileUpload(files);
    setIsMenuOpen(false);
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFileUpload(files);
    setIsMenuOpen(false);
  };

  const handlePasteClick = () => {
    onPasteImage();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    if (!disabled) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  return (
    <div className="attachment-button-container">
      <button
        type="button"
        onClick={toggleMenu}
        disabled={disabled}
        className={`attachment-button ${isMenuOpen ? 'active' : ''}`}
        title="Dosya veya resim ekle"
      >
        📎
      </button>

      {isMenuOpen && (
        <>
          {/* Overlay to close menu */}
          <div 
            className="attachment-overlay" 
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Attachment Menu */}
          <div className="attachment-menu">
            <div 
              className="attachment-option"
              onClick={() => imageInputRef.current?.click()}
            >
              <div className="option-icon">🖼️</div>
              <div className="option-content">
                <div className="option-title">Resim ekle</div>
                <div className="option-subtitle">PNG, JPG, GIF, WebP</div>
              </div>
            </div>

            <div 
              className="attachment-option"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="option-icon">📄</div>
              <div className="option-content">
                <div className="option-title">Dosya yükle</div>
                <div className="option-subtitle">PDF, TXT, JSON, vb.</div>
              </div>
            </div>

            <div 
              className="attachment-option"
              onClick={handlePasteClick}
            >
              <div className="option-icon">📸</div>
              <div className="option-content">
                <div className="option-title">Ekran görüntüsü yapıştır</div>
                <div className="option-subtitle">Win+Shift+S ile alınan</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleImageSelect(e.target.files)}
        style={{ display: 'none' }}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        accept="image/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.json"
        style={{ display: 'none' }}
      />
    </div>
  );
}