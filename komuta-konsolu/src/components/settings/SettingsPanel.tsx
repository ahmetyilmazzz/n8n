// src/components/settings/SettingsPanel.tsx
'use client';

import { AI_MODELS, TIER_ICONS } from "@/lib/ai-config";
import { AIModel, AIProvider } from "@/lib//types";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider: AIProvider;
  selectedModel: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (modelId: string) => void;
  onResetChat: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
  generatedFileCount: number;
  activeModel?: AIModel;
}

export const SettingsPanel = (props: Props) => {
  const { isOpen, onClose, selectedProvider, selectedModel, onProviderChange, onModelChange, onResetChat, onToggleTheme, theme, generatedFileCount, activeModel } = props;
  
  const availableModels = AI_MODELS.filter(model => model.provider === selectedProvider);

  return (
    <div className={`settings-panel ${isOpen ? 'settings-open' : ''}`} style={{ position: 'fixed', top: '70px', right: '20px', zIndex: 200 }}>
      {isOpen && (
        <div className="settings-content">
          <div className="settings-header">
            <h3>🤖 AI Ayarları</h3>
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
          <div className="setting-group">
            <label className="setting-label">AI Sağlayıcısı:</label>
            <div className="provider-buttons">
              <Button variant={selectedProvider === 'claude' ? 'active' : 'default'} onClick={() => onProviderChange('claude')}>🧠 Claude ({AI_MODELS.filter(m => m.provider === 'claude').length})</Button>
              <Button variant={selectedProvider === 'chatgpt' ? 'active' : 'default'} onClick={() => onProviderChange('chatgpt')}>🚀 ChatGPT ({AI_MODELS.filter(m => m.provider === 'chatgpt').length})</Button>
              <Button variant={selectedProvider === 'gemini' ? 'active' : 'default'} onClick={() => onProviderChange('gemini')}>💎 Gemini ({AI_MODELS.filter(m => m.provider === 'gemini').length})</Button>
            </div>
          </div>
          <div className="setting-group">
            <label className="setting-label">Model:</label>
            <Select value={selectedModel} onChange={(e) => onModelChange(e.target.value)}>
              <optgroup label="🚀 Flagship (En Güçlü)">{availableModels.filter(m => m.tier === 'flagship').map(model => (<option key={model.id} value={model.id}>{TIER_ICONS.flagship} {model.name}</option>))}</optgroup>
              <optgroup label="⚖️ Balanced (Dengeli)">{availableModels.filter(m => m.tier === 'balanced').map(model => (<option key={model.id} value={model.id}>{TIER_ICONS.balanced} {model.name}</option>))}</optgroup>
              <optgroup label="⚡ Fast (Hızlı)">{availableModels.filter(m => m.tier === 'fast').map(model => (<option key={model.id} value={model.id}>{TIER_ICONS.fast} {model.name}</option>))}</optgroup>
              {availableModels.some(m => m.tier === 'legacy') && <optgroup label="📦 Legacy (Eski)">{availableModels.filter(m => m.tier === 'legacy').map(model => (<option key={model.id} value={model.id}>{TIER_ICONS.legacy} {model.name}</option>))}</optgroup>}
            </Select>
          </div>
          {activeModel && <div className={`model-status status-${activeModel.tier || 'balanced'}`}><strong>Aktif Model:</strong> {TIER_ICONS[activeModel.tier || 'balanced']} {selectedProvider.toUpperCase()} - {activeModel.name}<span className="tier-badge">[{activeModel.tier?.toUpperCase() || 'BALANCED'}]</span></div>}
          {generatedFileCount > 0 && <div className="generated-files-counter">📁 <strong>{generatedFileCount}</strong> dosya oluşturuldu</div>}
          <div className="settings-actions">
            <Button onClick={onResetChat} variant="secondary">🗑️ Sıfırla</Button>
            <Button onClick={onToggleTheme} variant="secondary">{theme === 'light' ? '🌙' : '☀️'} Tema</Button>
          </div>
        </div>
      )}
    </div>
  );
};