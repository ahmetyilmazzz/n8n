import React, { useState, useEffect } from 'react';

interface GeneratedFile {
  id: string;
  name: string;
  content: string;
  type: 'javascript' | 'typescript' | 'python' | 'css' | 'html' | 'json' | 'txt' | 'markdown' | 'xml' | 'sql' | 'yaml';
  size: number;
  createdAt: Date;
}

interface FileViewerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  file: GeneratedFile | null;
}

export const FileViewerPanel: React.FC<FileViewerPanelProps> = ({ isOpen, onClose, file }) => {
  const [copied, setCopied] = useState(false);

  // Panel dışına tıklanınca kapat
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Dosya türüne göre ikon döndür
  const getFileIcon = (type: string) => {
    const icons = {
      javascript: '⚡',
      typescript: '🔷',
      python: '🐍',
      css: '🎨',
      html: '🌐',
      json: '📋',
      txt: '📄',
      markdown: '📝',
      xml: '📄',
      sql: '🗃️',
      yaml: '⚙️'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Dosya uzantısını al
  const getFileExtension = (type: string) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      css: 'css',
      html: 'html',
      json: 'json',
      txt: 'txt',
      markdown: 'md',
      xml: 'xml',
      sql: 'sql',
      yaml: 'yml'
    };
    return extensions[type as keyof typeof extensions] || 'txt';
  };

  // Dosyayı indir
  const downloadFile = () => {
    if (!file) return;

    const extension = getFileExtension(file.type);
    const fileName = file.name.endsWith(`.${extension}`) ? file.name : `${file.name}.${extension}`;
    
    const blob = new Blob([file.content], { 
      type: getMimeType(file.type) 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // MIME type al
  const getMimeType = (type: string) => {
    const mimeTypes = {
      javascript: 'text/javascript',
      typescript: 'text/typescript',
      python: 'text/x-python',
      css: 'text/css',
      html: 'text/html',
      json: 'application/json',
      txt: 'text/plain',
      markdown: 'text/markdown',
      xml: 'application/xml',
      sql: 'application/sql',
      yaml: 'text/yaml'
    };
    return mimeTypes[type as keyof typeof mimeTypes] || 'text/plain';
  };

  // Kopyala
  const copyToClipboard = async () => {
    if (!file) return;
    
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 
        shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        border-l border-gray-200 dark:border-gray-700
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFileIcon(file.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {file.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatFileSize(file.size)} • {file.type.toUpperCase()}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Paneli kapat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={downloadFile}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            İndir
          </button>
          
          <button
            onClick={copyToClipboard}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium
              ${copied 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Kopyalandı
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Kopyala
              </>
            )}
          </button>
        </div>

        {/* File Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <pre className="p-6 text-sm leading-relaxed font-mono bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 h-full">
              <code>{file.content}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Oluşturulma: {file.createdAt.toLocaleString('tr-TR')}
            </span>
            <span>
              {file.content.split('\n').length} satır
            </span>
          </div>
        </div>
      </div>
    </>
  );
};