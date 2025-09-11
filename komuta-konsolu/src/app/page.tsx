'use client';

import { FileViewerPanel } from '@/components/FileViewerPanel';
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat-hook';
import ReactMarkdown from 'react-markdown';

// AI Provider ve Model tipleri
type AIProvider = 'claude' | 'chatgpt' | 'gemini';

interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  tier?: 'flagship' | 'balanced' | 'fast' | 'legacy';
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
}

// FileViewerPanel için GeneratedFile tipi
interface GeneratedFile {
  id: string;
  name: string;
  content: string;
  type: 'javascript' | 'typescript' | 'python' | 'css' | 'html' | 'json' | 'txt' | 'markdown' | 'xml' | 'sql' | 'yaml';
  size: number;
  createdAt: Date;
}

const AI_MODELS: AIModel[] = [
  // Claude modelleri (Anthropic)
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Yeni)', provider: 'claude', tier: 'flagship' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'claude', tier: 'fast' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'claude', tier: 'balanced' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'claude', tier: 'fast' },
  { id: 'claude-haiku-3.5', name: 'Claude Haiku 3.5', provider: 'claude', tier: 'fast' },

  // amiral gemisi
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'claude', tier: 'flagship' },
  { id: 'claude-opus-4', name: 'Claude Opus 4.x', provider: 'claude', tier: 'flagship' },
  { id: 'claude-sonnet-3.7', name: 'Claude Sonnet 3.7', provider: 'claude', tier: 'flagship' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'claude', tier: 'flagship' },
  
  // ChatGPT modelleri (OpenAI)
  { id: 'gpt-4o', name: 'GPT-4o (En Yeni)', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'chatgpt', tier: 'balanced' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-5', name: '🚀 GPT-5 (Beta)', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-5-mini', name: '⚡ GPT-5 Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-5-nano', name: '🔹 GPT-5 Nano', provider: 'chatgpt', tier: 'fast' },
  { id: 'o3-deep-research', name: '🧠 o3 Deep Research', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o3-pro', name: '💎 o3 Pro', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o3', name: '🔬 o3 (Reasoning)', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o4-mini-deep-research', name: '🔍 o4 Mini Deep Research', provider: 'chatgpt', tier: 'balanced' },
  { id: 'o4-mini', name: '⚡ o4 Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'o1-pro', name: '👑 o1 Pro', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o1-preview', name: '🔍 o1 Preview', provider: 'chatgpt', tier: 'flagship' },
  { id: 'o1-mini', name: '⚡ o1 Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4.1', name: '🎯 GPT-4.1', provider: 'chatgpt', tier: 'balanced' },
  { id: 'gpt-4.1-mini', name: '🔹 GPT-4.1 Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4.1-nano', name: '💫 GPT-4.1 Nano', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4o-realtime', name: '🌐 GPT-4o Realtime', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-realtime', name: '🔴 GPT Realtime', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-audio', name: '🎵 GPT Audio', provider: 'chatgpt', tier: 'balanced' },
  { id: 'chatgpt-4o', name: '💬 ChatGPT-4o', provider: 'chatgpt', tier: 'flagship' },
  { id: 'babbage-002', name: '🔧 Babbage-002', provider: 'chatgpt', tier: 'legacy' },
  { id: 'davinci-002', name: '🎨 Davinci-002', provider: 'chatgpt', tier: 'legacy' },
  { id: 'codex-mini-latest', name: '💻 Codex Mini Latest', provider: 'chatgpt', tier: 'fast' },
  { id: 'dall-e-2', name: '🖼️ DALL-E 2', provider: 'chatgpt', tier: 'balanced' },
  { id: 'dall-e-3', name: '🎨 DALL-E 3', provider: 'chatgpt', tier: 'flagship' },

  
  // Gemini modelleri (Google)
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-1.5-pro-exp-0827', name: 'Gemini 1.5 Pro Experimental', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', tier: 'fast' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'gemini', tier: 'fast' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', provider: 'gemini', tier: 'balanced' },
  // YENİ GEMINI MODELLER
  { id: 'gemini-2.5-pro', name: '💎 Gemini 2.5 Pro', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-2.5-flash', name: '⚡ Gemini 2.5 Flash', provider: 'gemini', tier: 'fast' },
  { id: 'gemini-2.5-flash-lite', name: '🔹 Gemini 2.5 Flash-Lite', provider: 'gemini', tier: 'fast' },
  
  // Video ve Multimedya
  { id: 'veo-3', name: '🎬 Veo 3 (Video)', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-2.5-flash-image', name: '🖼️ Gemini 2.5 Flash Image', provider: 'gemini', tier: 'balanced' },
  
  // Embedding ve Özel Modeller
  { id: 'gemini-embeddings', name: '🔗 Gemini Embeddings', provider: 'gemini', tier: 'balanced' },

];

// Tier simgeleri
const TIER_ICONS = {
  flagship: '🚀',
  balanced: '⚖️',
  fast: '⚡',
  legacy: '📦'
};

// Model konfigürasyonları (o-series ve yeni modeller için)
const SPECIAL_MODEL_CONFIGS = {
  // O-series modelleri için özel ayarlar
  'o1-preview': { maxTokens: 32768, temperature: 1.0, supportsSystemPrompt: false },
  'o1-mini': { maxTokens: 65536, temperature: 1.0, supportsSystemPrompt: false },
  'o1-pro': { maxTokens: 32768, temperature: 1.0, supportsSystemPrompt: false },
  'o3': { maxTokens: 40000, temperature: 1.0, supportsSystemPrompt: false },
  'o3-pro': { maxTokens: 50000, temperature: 1.0, supportsSystemPrompt: false },
  'o3-deep-research': { maxTokens: 60000, temperature: 1.0, supportsSystemPrompt: false },
  'o4-mini': { maxTokens: 32768, temperature: 1.0, supportsSystemPrompt: false },
  'o4-mini-deep-research': { maxTokens: 40000, temperature: 1.0, supportsSystemPrompt: false },
  
  // GPT-5 serisi için ayarlar
  'gpt-5': { maxTokens: 128000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-5-mini': { maxTokens: 64000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-5-nano': { maxTokens: 32000, temperature: 0.7, supportsSystemPrompt: true },
  
  // GPT-4.1 serisi
  'gpt-4.1': { maxTokens: 32000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-4.1-mini': { maxTokens: 16000, temperature: 0.7, supportsSystemPrompt: true },
  'gpt-4.1-nano': { maxTokens: 8000, temperature: 0.7, supportsSystemPrompt: true },
  
  // Realtime modeller
  'gpt-realtime': { maxTokens: 16000, temperature: 0.7, supportsRealtime: true },
  'gpt-4o-realtime': { maxTokens: 32000, temperature: 0.7, supportsRealtime: true },
  
  // Gemini 2.5 serisi
  'gemini-2.5-pro': { maxTokens: 100000, temperature: 0.7, supportsMultimodal: true },
  'gemini-2.5-flash': { maxTokens: 50000, temperature: 0.7, supportsMultimodal: true },
  'veo-3': { maxTokens: 32000, temperature: 0.7, supportsVideo: true },
  
  // Claude 4.x serisi
  'claude-sonnet-4-20250514': { maxTokens: 200000, temperature: 0.7, supportsSystemPrompt: true },
  'claude-opus-4': { maxTokens: 200000, temperature: 0.7, supportsSystemPrompt: true },
};

// Suggestion örnekleri
const SUGGESTIONS = [
  "Python'da makine öğrenmesi projesi nasıl başlarım?",
  "React Native ile mobil uygulama geliştirme",
  "SQL veritabanı optimizasyon teknikleri",
  "Web güvenliği en iyi uygulamaları"
];

// Basit UI Bileşenleri
const Button = ({ children, variant = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'active' | 'secondary' }) => (
  <button 
    {...props} 
    className={`btn ${variant === 'active' ? 'btn-active' : variant === 'secondary' ? 'btn-secondary' : ''}`}
  >
    {children}
  </button>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="input-field" />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className="input-field" />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="select-field">
    {children}
  </select>
);

// Tema Hook
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Browser ortamında localStorage kontrolü
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
      
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  return { theme, toggleTheme };
};

// Dosya türü belirleme fonksiyonu
const detectFileType = (content: string, language?: string): GeneratedFile['type'] => {
  // İlk önce language parametresini kontrol et
  if (language) {
    const langMap: Record<string, GeneratedFile['type']> = {
      'javascript': 'javascript',
      'js': 'javascript',
      'typescript': 'typescript',
      'ts': 'typescript',
      'python': 'python',
      'py': 'python',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'markdown': 'markdown',
      'md': 'markdown',
      'xml': 'xml',
      'sql': 'sql',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    
    if (langMap[language.toLowerCase()]) {
      return langMap[language.toLowerCase()];
    }
  }

  // İçerik analizi ile tahmin et
  if (content.includes('import React') || content.includes('export default')) return 'typescript';
  if (content.includes('def ') || content.includes('import ')) return 'python';
  if (content.includes('<html') || content.includes('<!DOCTYPE')) return 'html';
  if (content.includes('{') && content.includes('"')) return 'json';
  if (content.includes('SELECT') || content.includes('CREATE TABLE')) return 'sql';
  if (content.includes('---') && content.includes(':')) return 'yaml';
  
  return 'txt';
};

// Terminal Kod Bloğu Bileşeni
const CodeBlock = ({ children, language = '' }: { children: string, language?: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dil ikonları
  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, string> = {
      python: '🐍',
      javascript: '⚡',
      typescript: '🔷',
      csharp: '💜',
      java: '☕',
      html: '🌐',
      css: '🎨',
      bash: '💻',
      shell: '💻',
      sql: '🗃️',
      json: '📋',
      xml: '📄'
    };
    return icons[lang.toLowerCase()] || '📄';
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="language-tag">
          {getLanguageIcon(language)} {language.toLowerCase() || 'kod'}
        </div>
        <button
          onClick={copyToClipboard}
          className="copy-btn"
        >
          {copied ? '✅ Kopyalandı' : '📋 Kopyala'}
        </button>
      </div>
      <pre className="code-content">
        <code>{children}</code>
      </pre>
    </div>
  );
};

// Attachment Seçici Bileşeni (Grok tarzı)
const AttachmentSelector = ({ onFileUpload, onImagePaste, isOpen, onClose }: {
  onFileUpload: (files: UploadedFile[]) => void;
  onImagePaste: () => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null, isImage = false) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Dosya boyutu kontrolü
      if (file.size > 10 * 1024 * 1024) {
        alert(`Dosya çok büyük: ${file.name}. Maksimum 10MB desteklenir.`);
        continue;
      }

      // Resim dosyası kontrolü (eğer resim seçici kullanıldıysa)
      if (isImage && !file.type.startsWith('image/')) {
        alert(`Sadece resim dosyaları seçebilirsiniz: ${file.name}`);
        continue;
      }

      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        data: fileData
      });
    }

    if (newFiles.length > 0) {
      onFileUpload(newFiles);
      onClose();
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handlePasteClick = () => {
    onImagePaste();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="attachment-overlay" onClick={onClose}></div>
      
      {/* Seçenekler Menüsü */}
      <div className="attachment-menu">
        <div className="attachment-option" onClick={handleImageClick}>
          <div className="attachment-icon">🖼️</div>
          <div className="attachment-text">
            <div className="attachment-title">Resim ekle</div>
            <div className="attachment-subtitle">Resim dosyalarını yükleyin</div>
          </div>
        </div>
        
        <div className="attachment-option" onClick={handleFileClick}>
          <div className="attachment-icon">📎</div>
          <div className="attachment-text">
            <div className="attachment-title">Dosya yükle</div>
            <div className="attachment-subtitle">Dokuman, PDF, vb.</div>
          </div>
        </div>

        <div className="attachment-option" onClick={handlePasteClick}>
          <div className="attachment-icon">📸</div>
          <div className="attachment-text">
            <div className="attachment-title">Ekran görüntüsü yapıştır</div>
            <div className="attachment-subtitle">Win+Shift+S ile alınan görüntü</div>
          </div>
        </div>
      </div>

      {/* Gizli input elementleri */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, true)}
        style={{ display: 'none' }}
      />
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, false)}
        style={{ display: 'none' }}
        accept="image/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.json"
      />
    </>
  );
};

// Yüklenen Dosyaları Göster
const UploadedFilesList = ({ files, onRemoveFile }: {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('text/')) return '📄';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word')) return '📘';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  if (files.length === 0) return null;

  return (
    <div className="uploaded-files-list">
      {files.map((file) => (
        <div key={file.id} className="uploaded-file-item">
          <div className="file-info">
            <span className="file-icon">{getFileIcon(file.type)}</span>
            <div className="file-details">
              <span className="file-name">{file.name}</span>
              <span className="file-size">({formatFileSize(file.size)})</span>
            </div>
          </div>
          <button
            onClick={() => onRemoveFile(file.id)}
            className="remove-file-btn"
            type="button"
            title="Dosyayı kaldır"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// Oluşturulan Dosyalar Listesi Bileşeni
const GeneratedFilesList = ({ files, onViewFile }: {
  files: GeneratedFile[];
  onViewFile: (file: GeneratedFile) => void;
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  if (files.length === 0) return null;

  return (
    <div className="generated-files-section">
      <h4 className="generated-files-title">📁 Oluşturulan Dosyalar</h4>
      <div className="generated-files-list">
        {files.map((file) => (
          <div
            key={file.id}
            className="generated-file-item"
            onClick={() => onViewFile(file)}
          >
            <div className="file-info">
              <span className="file-icon">{getFileIcon(file.type)}</span>
              <div className="file-details">
                <span className="file-name">{file.name}</span>
                <span className="file-meta">
                  {file.type.toUpperCase()} • {formatFileSize(file.size)}
                </span>
              </div>
            </div>
            <button className="view-file-btn" title="Dosyayı görüntüle">
              👁️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Markdown Mesaj Bileşeni
const MarkdownMessage = ({ content, isUser, onCodeDetected }: { 
  content: string, 
  isUser: boolean,
  onCodeDetected?: (code: string, language: string, filename?: string) => void 
}) => {
  if (isUser) {
    return <span>{content}</span>;
  }

  return (
    <ReactMarkdown
      components={{
        code: ({ node, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const isInline = !className || !className.startsWith('language-');
          const codeContent = String(children).replace(/\n$/, '');
          
          if (isInline) {
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          }

          // Kod bloğu algılandığında callback çağır
          if (onCodeDetected && codeContent.length > 50) { // Kısa kod parçalarını değil, dosya boyutundakileri al
            // Dosya adını tahmin et
            let filename = 'generated-code';
            if (language) {
              const extensions = {
                javascript: '.js',
                typescript: '.ts',
                python: '.py',
                css: '.css',
                html: '.html',
                json: '.json',
                markdown: '.md',
                xml: '.xml',
                sql: '.sql',
                yaml: '.yml'
              };
              filename += extensions[language as keyof typeof extensions] || '.txt';
            } else {
              filename += '.txt';
            }
            
            onCodeDetected(codeContent, language, filename);
          }

          return <CodeBlock language={language}>{codeContent}</CodeBlock>;
        },
        h1: ({ children }) => <h1 className="heading-1">{children}</h1>,
        h2: ({ children }) => <h2 className="heading-2">{children}</h2>,
        h3: ({ children }) => <h3 className="heading-3">{children}</h3>,
        ul: ({ children }) => <ul className="list-ul">{children}</ul>,
        ol: ({ children }) => <ol className="list-ol">{children}</ol>,
        li: ({ children }) => <li className="list-item">{children}</li>,
        p: ({ children }) => {
          const content = String(children);
          
          // JSON benzeri içerik algıla
          const isJSONLike = content.trim().match(/^\s*[\[{].*[\]}]\s*$/) && 
                            (content.includes('"') || content.includes(':'));
          
          if (isJSONLike) {
            try {
              const parsed = JSON.parse(content.trim());
              const formatted = JSON.stringify(parsed, null, 2);
              return <CodeBlock language="json">{formatted}</CodeBlock>;
            } catch {
              // JSON parse edilemezse normal paragraf olarak göster
            }
          }
          
          return <p className="paragraph">{children}</p>;
        },
        strong: ({ children }) => <strong className="bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        table: ({ children }) => <table className="table">{children}</table>,
        thead: ({ children }) => <thead className="table-head">{children}</thead>,
        th: ({ children }) => <th className="table-header">{children}</th>,
        td: ({ children }) => <td className="table-cell">{children}</td>,
        blockquote: ({ children }) => <blockquote className="blockquote">{children}</blockquote>
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default function ChatPage() {
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

  const { messages, isLoading, error, sendMessage, resetChat } = useChat({
    model: selectedModel,
    onError: (err) => {
      console.error("Bir Hata Oluştu:", err);
    }
  });

  // Seçilen provider'a göre modelleri filtrele
  const availableModels = AI_MODELS.filter(model => model.provider === selectedProvider);

  // Provider değiştiğinde ilk modeli seç
  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const firstModel = AI_MODELS.find(m => m.provider === provider);
    if (firstModel) {
      setSelectedModel(firstModel.id);
    }
  };

  // Kod algılandığında dosya oluştur
  const handleCodeDetected = (code: string, language: string, filename?: string) => {
    const fileType = detectFileType(code, language);
    const finalFilename = filename || `generated-${Date.now()}`;
    
    const newFile: GeneratedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: finalFilename.replace(/\.[^/.]+$/, ""), // Uzantıyı kaldır, detectFileType zaten ekleyecek
      content: code,
      type: fileType,
      size: new Blob([code]).size,
      createdAt: new Date()
    };

    setGeneratedFiles(prev => [...prev, newFile]);
  };

  // Dosya görüntüleme
  const handleViewFile = (file: GeneratedFile) => {
    setCurrentViewFile(file);
    setShowFileViewer(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Dosyalar ile beraber mesaj gönder
    sendMessage(inputValue, uploadedFiles);
    setInputValue('');
    setUploadedFiles([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Clipboard'dan resim yapıştırma
  const handleImagePaste = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        alert('Pano desteği bu tarayıcıda mevcut değil.');
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            
            reader.onload = (e) => {
              const imageData = e.target?.result as string;
              const newFile: UploadedFile = {
                id: Math.random().toString(36).substr(2, 9),
                name: `ekran-goruntusu-${Date.now()}.png`,
                type: 'image/png',
                size: blob.size,
                data: imageData
              };
              setUploadedFiles(prev => [...prev, newFile]);
            };
            
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      
      alert('Panoda resim bulunamadı. Windows+Shift+S ile ekran görüntüsü alın.');
    } catch (err) {
      console.error('Pano erişim hatası:', err);
      alert('Panoya erişim izni gerekli. Lütfen tarayıcı ayarlarını kontrol edin.');
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  // Sıfırla işlemi - oluşturulan dosyaları da temizle
  const handleResetChat = () => {
    resetChat();
    setGeneratedFiles([]);
  };

  // Aktif modelin bilgilerini al
  const activeModel = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="chat-app">
      {/* Ana Chat Alanı */}
      <div className="chat-main">
        {/* Sağ üst köşede tema ve ayarlar */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 200,
          display: 'flex',
          gap: '8px'
        }}>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="settings-toggle"
            title="AI Ayarları"
            style={{ position: 'static' }}
          >
            ⚙️
          </button>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="empty-suggestions">
              {SUGGESTIONS.map((suggestion, index) => (
                <div 
                  key={index}
                  className="suggestion-card"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}>
              <div className="message-header">
                <span className="message-author">
                  {msg.role === 'user' ? '👤 Siz' : `🤖 ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}`}
                </span>
                <span className="message-time">
                  {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="message-content">
                <MarkdownMessage 
                  content={msg.content} 
                  isUser={msg.role === 'user'}
                  onCodeDetected={msg.role === 'assistant' ? handleCodeDetected : undefined}
                />
              </div>
            </div>
          ))}
          
          {/* Oluşturulan Dosyalar Bölümü */}
          {generatedFiles.length > 0 && (
            <GeneratedFilesList 
              files={generatedFiles}
              onViewFile={handleViewFile}
            />
          )}
          
          {isLoading && (
            <div className="loading-message">
              <div className="loading-icon">🤖</div>
              <div className="loading-text">AI Düşünüyor...</div>
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <div className="loading-model">
                {TIER_ICONS[activeModel?.tier || 'balanced']} {selectedProvider.toUpperCase()} - {activeModel?.name}
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              ⚠️ <strong>HATA:</strong> {error}
            </div>
          )}
        </div>

        {/* Input Alanı */}
        <div className="input-container">
          <div className="input-wrapper">
            <form onSubmit={handleSubmit} className="input-form">
              {/* Yüklenen Dosyalar */}
              <UploadedFilesList 
                files={uploadedFiles}
                onRemoveFile={handleRemoveFile}
              />

              {/* Ana input */}
              <div className="input-main">
                <button
                  type="button"
                  onClick={() => setShowAttachment(!showAttachment)}
                  className="attachment-btn"
                  title="Dosya veya resim ekle"
                >
                  📎
                </button>
                
                <TextArea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={`${activeModel?.name} ile sohbet edin...`}
                  disabled={isLoading}
                  rows={1}
                  style={{ resize: 'none' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && inputValue.trim()) {
                        handleSubmit(e as any);
                      }
                    }
                  }}
                />
                <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                  {isLoading ? '⏳' : '📤'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Attachment Seçici */}
      <AttachmentSelector 
        isOpen={showAttachment}
        onClose={() => setShowAttachment(false)}
        onFileUpload={handleFileUpload}
        onImagePaste={handleImagePaste}
      />

      {/* Dosya Görüntüleme Paneli */}
      <FileViewerPanel
        isOpen={showFileViewer}
        onClose={() => setShowFileViewer(false)}
        file={currentViewFile}
      />

      {/* Sağ Alt Ayarlar Paneli */}
      <div className={`settings-panel ${showSettings ? 'settings-open' : ''}`} style={{
        position: 'fixed',
        top: '70px',
        right: '20px',
        zIndex: 200
      }}>
        {showSettings && (
          <div className="settings-content">
            <div className="settings-header">
              <h3>🤖 AI Ayarları</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            {/* Provider Seçici */}
            <div className="setting-group">
              <label className="setting-label">AI Sağlayıcısı:</label>
              <div className="provider-buttons">
                <Button 
                  variant={selectedProvider === 'claude' ? 'active' : 'default'}
                  onClick={() => handleProviderChange('claude')}
                >
                  🧠 Claude ({AI_MODELS.filter(m => m.provider === 'claude').length})
                </Button>
                <Button 
                  variant={selectedProvider === 'chatgpt' ? 'active' : 'default'}
                  onClick={() => handleProviderChange('chatgpt')}
                >
                  🚀 ChatGPT ({AI_MODELS.filter(m => m.provider === 'chatgpt').length})
                </Button>
                <Button 
                  variant={selectedProvider === 'gemini' ? 'active' : 'default'}
                  onClick={() => handleProviderChange('gemini')}
                >
                  💎 Gemini ({AI_MODELS.filter(m => m.provider === 'gemini').length})
                </Button>
              </div>
            </div>

            {/* Model Seçici */}
            <div className="setting-group">
              <label className="setting-label">Model:</label>
              <Select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <optgroup label="🚀 Flagship (En Güçlü)">
                  {availableModels.filter(m => m.tier === 'flagship').map(model => (
                    <option key={model.id} value={model.id}>
                      {TIER_ICONS[model.tier || 'balanced']} {model.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⚖️ Balanced (Dengeli)">
                  {availableModels.filter(m => m.tier === 'balanced').map(model => (
                    <option key={model.id} value={model.id}>
                      {TIER_ICONS[model.tier || 'balanced']} {model.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⚡ Fast (Hızlı)">
                  {availableModels.filter(m => m.tier === 'fast').map(model => (
                    <option key={model.id} value={model.id}>
                      {TIER_ICONS[model.tier || 'fast']} {model.name}
                    </option>
                  ))}
                </optgroup>
                {availableModels.some(m => m.tier === 'legacy') && (
                  <optgroup label="📦 Legacy (Eski)">
                    {availableModels.filter(m => m.tier === 'legacy').map(model => (
                      <option key={model.id} value={model.id}>
                        {TIER_ICONS[model.tier || 'legacy']} {model.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </Select>
            </div>

            {/* Aktif Model Bilgisi */}
            {activeModel && (
              <div className={`model-status status-${activeModel.tier || 'balanced'}`}>
                <strong>Aktif Model:</strong> {TIER_ICONS[activeModel.tier || 'balanced']} {selectedProvider.toUpperCase()} - {activeModel.name}
                <span className="tier-badge">
                  [{activeModel.tier?.toUpperCase() || 'BALANCED'}]
                </span>
              </div>
            )}

            {/* Dosya Sayacı */}
            {generatedFiles.length > 0 && (
              <div className="generated-files-counter">
                📁 <strong>{generatedFiles.length}</strong> dosya oluşturuldu
              </div>
            )}

            <div className="settings-actions">
              <Button onClick={handleResetChat} disabled={isLoading} variant="secondary">
                🗑️ Sıfırla
              </Button>
              <Button onClick={toggleTheme} variant="secondary">
                {theme === 'light' ? '🌙' : '☀️'} Tema
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}