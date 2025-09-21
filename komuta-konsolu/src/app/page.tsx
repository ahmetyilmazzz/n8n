// src/app/page.tsx
'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useChat } from '@/hooks/use-chat-hook';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/Header';

// Tipler, Sabitler ve Yardımcı Fonksiyonlar
import { AIProvider, UploadedFile, GeneratedFile } from '@/lib/types';
import { AI_MODELS } from '@/lib/ai-config';
import { detectFileType } from '@/lib/utils';

// Bileşenler
import { FileViewerPanel } from '@/components/FileViewerPanel';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { AttachmentSelector } from '@/components/attachments/AttachmentSelector';
import { UploadedFilesList } from '@/components/attachments/UploadedFilesList';
import { EmptyState } from '@/components/chat/EmptyState';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { GeneratedFilesList } from '@/components/chat/GeneratedFilesList';
import { LoadingIndicator } from '@/components/chat/LoadingIndicator';
import { ErrorDisplay } from '@/components/chat/ErrorDisplay';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';

export default function ChatPage() {
  // --- STATE YÖNETİMİ ---
  const [inputValue, setInputValue] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('claude');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [showSettings, setShowSettings] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showAttachment, setShowAttachment] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [currentViewFile, setCurrentViewFile] = useState<GeneratedFile | null>(null);
  
  const { theme, toggleTheme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, sendMessage, resetChat } = useChat({model: selectedModel, onError: (err) => console.error("Bir Hata Oluştu:", err.message),});

  // --- HANDLER FONKSİYONLARI ---

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const firstModel = AI_MODELS.find(m => m.provider === provider);
    if (firstModel) setSelectedModel(firstModel.id);
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

  const handleViewFile = (file: GeneratedFile) => {
    setCurrentViewFile(file);
    setShowFileViewer(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue, uploadedFiles);
    setInputValue('');
    setUploadedFiles([]);
    textareaRef.current?.style.setProperty('height', 'auto');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (newFiles: UploadedFile[]) => setUploadedFiles(prev => [...prev, ...newFiles]);
  const handleRemoveFile = (fileId: string) => setUploadedFiles(prev => prev.filter(f => f.id !== fileId));

  const handleImagePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (e) => {
            const newFile: UploadedFile = {
              id: Math.random().toString(36).substr(2, 9), name: `ekran-goruntusu-${Date.now()}.png`,
              type: blob.type, size: blob.size, data: e.target?.result as string,
            };
            setUploadedFiles(prev => [...prev, newFile]);
          };
          reader.readAsDataURL(blob);
          return; // Sadece ilk resmi al
        }
      }
      alert('Panoda resim bulunamadı.');
    } catch (err) {
      console.error('Pano erişim hatası:', err);
      alert('Panoya erişim izni gerekli.');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleResetChat = () => {
    resetChat();
    setGeneratedFiles([]);
  };

  const activeModel = AI_MODELS.find(m => m.id === selectedModel);

  // --- RENDER ---

  return (
  <div className="chat-app">
    <Header
      selectedProvider={selectedProvider}
      selectedModel={selectedModel}
      onProviderChange={handleProviderChange}
      onModelChange={setSelectedModel}
      onNewChat={handleResetChat}
    />
    
    <div className={`chat-main ${messages.length === 0 ? 'empty-chat' : 'has-messages'}`}>
      <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 200, display: 'flex', gap: '8px' }}>
        <button onClick={toggleTheme} className="theme-toggle">{theme === 'light' ? '🌙' : '☀️'}</button>
        <button onClick={() => setShowSettings(!showSettings)} className="settings-toggle" title="AI Ayarları">⚙️</button>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            provider={selectedProvider}
            onCodeDetected={msg.role === 'assistant' ? handleCodeDetected : undefined}
          />
        ))}
        {generatedFiles.length > 0 && <GeneratedFilesList files={generatedFiles} onViewFile={handleViewFile} />}
        {isLoading && <LoadingIndicator provider={selectedProvider} activeModel={activeModel} />}
        {error && <ErrorDisplay error={error.message} />}
      </div>

      <div className="modern-input-container">
        <div className="modern-input-wrapper">
          <UploadedFilesList files={uploadedFiles} onRemoveFile={handleRemoveFile} />
          <form onSubmit={handleSubmit} className="modern-input-form">
            <div className="input-with-actions">
              <button type="button" onClick={() => setShowAttachment(true)} className="modern-attachment-btn" title="Dosya ekle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C13.1 2 14 2.9 14 4V16C14 17.1 13.1 18 12 18S10 17.1 10 16V4C10 2.9 10.9 2 12 2M12 0C8.69 0 6 2.69 6 6V16C6 19.31 8.69 22 12 22S18 19.31 18 16V6C18 2.69 15.31 0 12 0Z"/>
                </svg>
              </button>
              <TextArea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={`${activeModel?.name || 'AI'} ile sohbet edin...`}
                disabled={isLoading}
                className="modern-textarea"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading && inputValue.trim()) handleSubmit(e as any);
                  }
                }}
              />
              <button type="submit" disabled={isLoading || !inputValue.trim()} className="modern-send-btn">
                {isLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <AttachmentSelector isOpen={showAttachment} onClose={() => setShowAttachment(false)} onFileUpload={handleFileUpload} onImagePaste={handleImagePaste} />
    <FileViewerPanel isOpen={showFileViewer} onClose={() => setShowFileViewer(false)} file={currentViewFile} />
    <SettingsPanel
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      selectedProvider={selectedProvider}
      selectedModel={selectedModel}
      onProviderChange={handleProviderChange}
      onModelChange={setSelectedModel}
      onResetChat={handleResetChat}
      onToggleTheme={toggleTheme}
      theme={theme}
      generatedFileCount={generatedFiles.length}
      activeModel={activeModel}
    />
  </div>
);