'use client';

import { useState } from 'react';
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

const AI_MODELS: AIModel[] = [
  // Claude modelleri (Anthropic)
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Yeni)', provider: 'claude', tier: 'flagship' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'claude', tier: 'fast' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'claude', tier: 'flagship' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'claude', tier: 'balanced' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'claude', tier: 'fast' },
  
  // ChatGPT modelleri (OpenAI)
  { id: 'gpt-4o', name: 'GPT-4o (En Yeni)', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', provider: 'chatgpt', tier: 'flagship' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'chatgpt', tier: 'balanced' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'chatgpt', tier: 'fast' },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', provider: 'chatgpt', tier: 'fast' },
  
  // Gemini modelleri (Google)
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-1.5-pro-exp-0827', name: 'Gemini 1.5 Pro Experimental', provider: 'gemini', tier: 'flagship' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', tier: 'fast' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'gemini', tier: 'fast' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', provider: 'gemini', tier: 'balanced' },
];

// Tier renkleri
const TIER_COLORS = {
  flagship: '#ff6b6b', // Kırmızı - En güçlü
  balanced: '#4ecdc4', // Teal - Dengeli
  fast: '#45b7d1',     // Mavi - Hızlı
  legacy: '#96ceb4'    // Yeşil - Eski
};

// Tier simgeleri
const TIER_ICONS = {
  flagship: '🚀',
  balanced: '⚖️',
  fast: '⚡',
  legacy: '🔒'
};

// Basit UI Bileşenleri
const Button = ({ children, variant = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'active' }) => (
  <button 
    {...props} 
    className={`btn ${variant === 'active' ? 'btn-active' : ''}`}
  >
    {children}
  </button>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="input-field" />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="select-field">
    {children}
  </select>
);

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
    return icons[lang.toLowerCase()] || '📝';
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="code-info">
          <span className="language-tag">
            {getLanguageIcon(language)} {language.toLowerCase() || 'kod'}
          </span>
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

// Markdown Mesaj Bileşeni
const MarkdownMessage = ({ content, isUser }: { content: string, isUser: boolean }) => {
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
          
          if (isInline) {
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          }

          return <CodeBlock language={language}>{String(children).replace(/\n$/, '')}</CodeBlock>;
        },
        h1: ({ children }) => <h1 className="heading-1">{children}</h1>,
        h2: ({ children }) => <h2 className="heading-2">{children}</h2>,
        h3: ({ children }) => <h3 className="heading-3">{children}</h3>,
        ul: ({ children }) => <ul className="list-ul">{children}</ul>,
        ol: ({ children }) => <ol className="list-ol">{children}</ol>,
        li: ({ children }) => <li className="list-item">{children}</li>,
        p: ({ children }) => {
          const content = String(children);
          
          // JSON benzeri içerik algıla (düzeltilmiş regex)
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  // Aktif modelin bilgilerini al
  const activeModel = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="chat-app">
      {/* Ana Chat Alanı */}
      <div className="chat-main">
        {/* Chat Container */}
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💭</div>
              <p className="empty-text">Sohbet geçmişi boş.</p>
              <p className="empty-subtitle">Aktif: <strong>{activeModel?.name}</strong></p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}>
              <div className="message-header">
                <span className="message-author">
                  {msg.role === 'user' ? '👤 Komutan' : `🤖 Sistem (${selectedProvider.toUpperCase()})`}
                </span>
              </div>
              <div className="message-content">
                <MarkdownMessage content={msg.content} isUser={msg.role === 'user'} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="loading-message">
              <div className="loading-icon">🤖</div>
              <div className="loading-text">Sistem düşünüyor</div>
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
          <form onSubmit={handleSubmit} className="input-form">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`${activeModel?.name} sistemine mesajınızı yazın...`}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '⏳' : '📤'}
            </Button>
          </form>
        </div>
      </div>

      {/* Sağ Alt Ayarlar Paneli */}
      <div className={`settings-panel ${showSettings ? 'settings-open' : ''}`}>
        {showSettings && (
          <div className="settings-content">
            <div className="settings-header">
              <h3>🤖 AI Sistemi Seçici</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            {/* Provider Seçici */}
            <div className="setting-group">
              <label className="setting-label">Sistem:</label>
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
                  <optgroup label="🔒 Legacy (Eski)">
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
                <strong>Aktif:</strong> {TIER_ICONS[activeModel.tier || 'balanced']} {selectedProvider.toUpperCase()} - {activeModel.name} 
                <span className="tier-badge">
                  [{activeModel.tier?.toUpperCase() || 'BALANCED'}]
                </span>
              </div>
            )}

            <div className="settings-actions">
              <Button onClick={resetChat} disabled={isLoading}>
                🗑️ Sıfırla
              </Button>
            </div>
          </div>
        )}
        
        {/* Ayarlar Butonu */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="settings-toggle"
          title="AI Ayarları"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}