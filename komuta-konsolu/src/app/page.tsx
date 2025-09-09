'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/use-chat-hook';

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
  legacy: '📁'
};

// Basit UI Bileşenleri
const Button = ({ children, variant = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'active' }) => (
  <button 
    {...props} 
    style={{ 
      padding: '8px 12px', 
      margin: '4px', 
      cursor: 'pointer',
      border: '1px solid #ccc',
      borderRadius: '6px',
      backgroundColor: variant === 'active' ? '#007bff' : '#f8f9fa',
      color: variant === 'active' ? 'white' : 'black',
      transition: 'all 0.2s'
    }}
  >
    {children}
  </button>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} style={{ padding: '8px', width: 'calc(100% - 100px)', border: '1px solid #ccc', borderRadius: '4px' }} />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' }}>
    {children}
  </select>
);

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('claude');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022'); // Güncellenmiş model

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
    <div style={{ fontFamily: 'sans-serif', maxWidth: '768px', margin: 'auto', padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ textAlign: 'center' }}>🏯 Merkezi Komuta Konsolu v2.0</h1>

      {/* AI Seçici Panel */}
      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>🤖 AI Sistemi Seçici</h3>
        
        {/* Provider Butonları */}
        <div style={{ marginBottom: '15px' }}>
          <span style={{ fontSize: '14px', marginRight: '10px', fontWeight: 'bold' }}>Sistem:</span>
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

        {/* Model Seçici */}
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', marginRight: '10px', fontWeight: 'bold' }}>Model:</span>
          <Select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {/* Modelleri tier'a göre grupla */}
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
              <optgroup label="📁 Legacy (Eski)">
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
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            backgroundColor: TIER_COLORS[activeModel.tier || 'balanced'] + '20',
            padding: '8px', 
            borderRadius: '4px',
            border: `1px solid ${TIER_COLORS[activeModel.tier || 'balanced']}40`
          }}>
            <strong>Aktif:</strong> {TIER_ICONS[activeModel.tier || 'balanced']} {selectedProvider.toUpperCase()} - {activeModel.name} 
            <span style={{ marginLeft: '8px', color: TIER_COLORS[activeModel.tier || 'balanced'] }}>
              [{activeModel.tier?.toUpperCase() || 'BALANCED'}]
            </span>
          </div>
        )}
      </div>

      {/* Chat Alanı */}
      <div style={{ flexGrow: 1, border: '1px solid #ccc', padding: '10px', overflowY: 'auto', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        {messages.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
            <p>💭 Sohbet geçmişi boş.</p>
            <p style={{ fontSize: '12px' }}>Aktif: <strong>{activeModel?.name}</strong></p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '15px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <span style={{ fontWeight: 'bold', display: 'block', fontSize: '0.9em', marginBottom: '4px' }}>
              {msg.role === 'user' ? '👤 Komutan' : `🤖 Sistem (${selectedProvider.toUpperCase()})`}
            </span>
            <div style={{ 
              display: 'inline-block', 
              padding: '10px 14px', 
              borderRadius: '12px', 
              backgroundColor: msg.role === 'user' ? '#007bff' : '#ffffff', 
              color: msg.role === 'user' ? 'white' : 'black',
              maxWidth: '80%',
              wordWrap: 'break-word',
              border: msg.role === 'assistant' ? '1px solid #dee2e6' : 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            <div style={{ fontSize: '16px' }}>🤖 Sistem düşünüyor...</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              {TIER_ICONS[activeModel?.tier || 'balanced']} {selectedProvider.toUpperCase()} - {activeModel?.name}
            </div>
          </div>
        )}
        {error && (
          <div style={{ 
            color: '#dc3545', 
            textAlign: 'center', 
            marginTop: '10px', 
            padding: '10px',
            backgroundColor: '#f8d7da',
            borderRadius: '6px',
            border: '1px solid #f5c6cb'
          }}>
            ⚠️ <strong>HATA:</strong> {error}
          </div>
        )}
      </div>

      {/* Kontrol Alanı */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <Button onClick={resetChat} disabled={isLoading} variant="default">
          🗑️ Sıfırla
        </Button>
        <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>
          Toplam Model: {AI_MODELS.length} | Aktif: {activeModel?.name}
        </span>
      </div>

      {/* Mesaj Gönderme Alanı */}
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`${activeModel?.name} sistemine mesajınızı yazın...`}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '⏳' : '📤 Gönder'}
        </Button>
      </form>
    </div>
  );
}