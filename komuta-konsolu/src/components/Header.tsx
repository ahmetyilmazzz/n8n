'use client';

import React, { useState } from 'react';
import { AIProvider } from '@/lib/types';
import { AI_MODELS } from '@/lib/ai-config';

interface HeaderProps {
  selectedProvider: AIProvider;
  selectedModel: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  onNewChat,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeModel = AI_MODELS.find(m => m.id === selectedModel);
  
  const handleModelSelect = (provider: AIProvider, modelId: string) => {
    onProviderChange(provider);
    onModelChange(modelId);
    setIsDropdownOpen(false);
  };
  
  return (
    <header className="clean-header">
      <div className="clean-header-content">
        <div className="header-left">
          <div className="logo">
            <span className="logo-text">PADİŞAH.AI</span>
          </div>
          
          <button onClick={onNewChat} className="new-chat-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m7-7H5"/>
            </svg>
            <span>Yeni Sohbet</span>
          </button>
        </div>

        <div className="header-right">
          <div className="simple-model-selector">
            <button 
              className="simple-model-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="provider-dot">
                {selectedProvider === 'claude' && <span className="dot purple"></span>}
                {selectedProvider === 'chatgpt' && <span className="dot green"></span>}
                {selectedProvider === 'gemini' && <span className="dot blue"></span>}
              </span>
              <span className="model-name">{activeModel?.name || 'Model Seç'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5H7z"/>
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="simple-dropdown">
                <div className="dropdown-section">
                  <div className="section-title">Claude</div>
                  {AI_MODELS.filter(m => m.provider === 'claude').slice(0, 4).map(model => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect('claude', model.id)}
                      className={`dropdown-item ${selectedModel === model.id ? 'active' : ''}`}
                    >
                      <span className="dot purple"></span>
                      {model.name}
                    </button>
                  ))}
                </div>
                
                <div className="dropdown-section">
                  <div className="section-title">ChatGPT</div>
                  {AI_MODELS.filter(m => m.provider === 'chatgpt').slice(0, 4).map(model => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect('chatgpt', model.id)}
                      className={`dropdown-item ${selectedModel === model.id ? 'active' : ''}`}
                    >
                      <span className="dot green"></span>
                      {model.name}
                    </button>
                  ))}
                </div>
                
                <div className="dropdown-section">
                  <div className="section-title">Gemini</div>
                  {AI_MODELS.filter(m => m.provider === 'gemini').slice(0, 4).map(model => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect('gemini', model.id)}
                      className={`dropdown-item ${selectedModel === model.id ? 'active' : ''}`}
                    >
                      <span className="dot blue"></span>
                      {model.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isDropdownOpen && (
        <div 
          className="dropdown-backdrop" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};