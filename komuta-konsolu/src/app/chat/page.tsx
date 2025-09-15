'use client';

import { useState, useRef, useCallback } from 'react';
import { MessageList } from '@/features/chat/components/MessageList';
import { Composer } from '@/features/chat/components/Composer';
import { PreviewPanel } from '@/features/files/components/PreviewPanel';
import { ModelPicker } from '@/features/models/components/ModelPicker';
import { useChat } from '@/features/chat/hooks/useChat';
import { useTheme } from '@/lib/theme';
import { uploadMultipleFiles, pasteImageFromClipboard, type UploadedFile } from '@/features/files/lib/upload';
import { detectFileType, type GeneratedFile } from '@/features/files/lib/file-sniff';
import type { Message } from '@/types/message';
import type { ModelInfo } from '@/types/model';

const SUGGESTIONS = [
  "Python'da makine öğrenmesi projesi nasıl başlarım?",
  'React Native ile mobil uygulama geliştirme',
  'SQL veritabanı optimizasyon teknikleri', 
  'Web güvenliği en iyi uygulamaları'
];

export default function ChatPage() {
  // State management
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-5-sonnet-20241022');
  const [showSettings, setShowSettings] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [currentViewFile, setCurrentViewFile] = useState<GeneratedFile | null>(null);

  // Refs
  const processedKeysRef = useRef<Set<string>>(new Set());

  // Hooks
  const { theme, toggleTheme } = useTheme();
  const { messages, isLoading, error, sendMessage, resetChat } = useChat({
    model: selectedModel,
    onError: (err) => console.error('Chat hatası:', err)
  });

  // Kod algılama ve dosya oluşturma
  const handleCodeDetected = useCallback((code: string, language: string, filename?: string) => {
    const key = `${language || 'plain'}::${filename || 'noname'}::${code.length}::${code.slice(0, 50)}`;
    
    // Aynı kodun tekrar oluşturulmasını engelle
    if (processedKeysRef.current.has(key)) return;
    processedKeysRef.current.add(key);

    const fileType = detectFileType(code, language);
    
    const newFile: GeneratedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: filename || `generated-${Date.now()}.${fileType === 'txt' ? 'txt' : fileType}`,
      content: code,
      type: fileType,
      size: new Blob([code]).size,
      createdAt: new Date(),
      lineCount: code.split('\n').length
    };

    setGeneratedFiles(prev => [...prev, newFile]);
    
    // Dosyayı otomatik olarak aç
    setCurrentViewFile(newFile);
    setShowFileViewer(true);
  }, []);

  // Dosya yükleme işlemleri
  const handleFileUpload = async (fileList: FileList) => {
    try {
      const newFiles = await uploadMultipleFiles(fileList, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/*', 'text/*', 'application/pdf', 'application/json']
      });
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
    }
  };

  const handlePasteImage = async () => {
    try {
      const pastedFile = await pasteImageFromClipboard();
      if (pastedFile) {
        setUploadedFiles(prev => [...prev, pastedFile]);
      } else {
        alert('Panoda resim bulunamadı. Windows+Shift+S ile ekran görüntüsü alın.');
      }
    } catch (error) {
      console.error('Pano hatası:', error);
      alert('Panoya erişim izni gerekli. Lütfen tarayıcı ayarlarını kontrol edin.');
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Mesaj gönderme
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    sendMessage(content, uploadedFiles);
    setUploadedFiles([]); // Mesaj gönderildikten sonra dosyaları temizle
  };

  // Öneri tıklama
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Dosya görüntüleme
  const handleViewFile = (file: GeneratedFile) => {
    setCurrentViewFile(file);
    setShowFileViewer(true);
  };

  // Chat sıfırlama
  const handleResetChat = () => {
    resetChat();
    setGeneratedFiles([]);
    setCurrentViewFile(null);
    setShowFileViewer(false);
    setUploadedFiles([]);
    processedKeysRef.current.clear();
  };

  // Model değişikliği
  const handleModelChange = (model: ModelInfo) => {
    setSelectedModel(model.id);
  };

  return (
    <div className="chat-app">
      {/* Ana Chat Container */}
      <div className="chat-main">
        {/* Header Controls */}
        <header className="chat-header">
          <div className="chat-title">
            <h1>🤖 AI Komuta Konsolu</h1>
            <span className="chat-subtitle">
              Claude • ChatGPT • Gemini
            </span>
          </div>
          
          <div className="header-controls">
            <button 
              onClick={toggleTheme} 
              className="control-btn"
              title="Tema değiştir"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="control-btn"
              title="Ayarlar"
            >
              ⚙️
            </button>
            
            <button
              onClick={handleResetChat}
              className="control-btn"
              title="Sohbeti temizle"
              disabled={isLoading}
            >
              🗑️
            </button>
          </div>
        </header>

        {/* Ana İçerik Alanı */}
        <main className="chat-content">
          {/* Mesaj Listesi */}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            error={error}
            selectedModel={selectedModel}
            suggestions={messages.length === 0 ? SUGGESTIONS : []}
            onSuggestionClick={handleSuggestionClick}
            onCodeDetected={handleCodeDetected}
          />

          {/* Oluşturulan Dosyalar */}
          {generatedFiles.length > 0 && (
            <section className="generated-files-section">
              <h3 className="section-title">
                📁 Oluşturulan Dosyalar ({generatedFiles.length})
              </h3>
              <div className="generated-files-grid">
                {generatedFiles.map(file => (
                  <div 
                    key={file.id} 
                    className="generated-file-card"
                    onClick={() => handleViewFile(file)}
                  >
                    <div className="file-icon">
                      {file.type === 'javascript' ? '⚡' :
                       file.type === 'typescript' ? '🔷' :
                       file.type === 'python' ? '🐍' :
                       file.type === 'css' ? '🎨' :
                       file.type === 'html' ? '🌐' :
                       file.type === 'json' ? '📋' :
                       file.type === 'sql' ? '🗃️' : '📄'}
                    </div>
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-meta">
                        {file.lineCount} satır • {(file.size / 1024).toFixed(1)}KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Composer */}
        <Composer
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onPasteImage={handlePasteImage}
          onRemoveFile={handleRemoveFile}
          uploadedFiles={uploadedFiles}
          selectedModel={selectedModel}
          isLoading={isLoading}
        />
      </div>

      {/* Sağ Taraf Panelleri */}
      <aside className="sidebar-panels">
        {/* Model Seçici Panel */}
        {showSettings && (
          <div className="settings-panel">
            <div className="panel-header">
              <h3>🤖 AI Modelleri</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <ModelPicker
              selectedModelId={selectedModel}
              onModelChange={handleModelChange}
            />

            <div className="panel-stats">
              {generatedFiles.length > 0 && (
                <div className="stat-item">
                  📁 {generatedFiles.length} dosya oluşturuldu
                </div>
              )}
              <div className="stat-item">
                💬 {messages.length} mesaj
              </div>
            </div>
          </div>
        )}

        {/* Dosya Önizleme Paneli */}
        <PreviewPanel
          isOpen={showFileViewer}
          onClose={() => setShowFileViewer(false)}
          file={currentViewFile}
        />
      </aside>
    </div>
  );
}