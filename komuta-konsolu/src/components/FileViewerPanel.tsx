// components/FileViewerPanel.tsx
import React, { useState } from 'react';

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

export const FileViewerPanel: React.FC<FileViewerPanelProps> = ({
  isOpen,
  onClose,
  file
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  const downloadFile = () => {
    const extensions = {
      javascript: '.js',
      typescript: '.ts',
      python: '.py',
      css: '.css',
      html: '.html',
      json: '.json',
      txt: '.txt',
      markdown: '.md',
      xml: '.xml',
      sql: '.sql',
      yaml: '.yml'
    };

    const extension = extensions[file.type] || '.txt';
    const fileName = file.name.includes('.') ? file.name : `${file.name}${extension}`;
    
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="file-viewer-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}
      />
      
      {/* Panel */}
      <div 
        className="file-viewer-panel"
        style={{
          position: 'fixed',
          top: '5%',
          right: '5%',
          bottom: '5%',
          width: '60%',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Header */}
        <div 
          className="file-viewer-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{getFileIcon(file.type)}</span>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '600',
                color: 'var(--text-primary)' 
              }}>
                {file.name}
              </h3>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--text-secondary)',
                display: 'flex',
                gap: '8px',
                marginTop: '2px'
              }}>
                <span>{file.type.toUpperCase()}</span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{file.createdAt.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={copyToClipboard}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copied ? '✅ Kopyalandı' : '📋 Kopyala'}
            </button>
            
            <button
              onClick={downloadFile}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              💾 İndir
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="file-viewer-content"
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <pre 
            style={{
              flex: 1,
              margin: 0,
              padding: '20px',
              overflow: 'auto',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            <code>{file.content}</code>
          </pre>
        </div>
      </div>
    </>
  );
};