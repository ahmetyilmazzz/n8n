// src/components/chat/MessageBubble.tsx
import { Message } from 'ai/react';
import { AIProvider } from '@/lib/types';
import { MarkdownMessage } from './MarkdownMessage';
import { useState, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

type Props = {
  message: Message;
  provider: AIProvider;
  onCodeDetected?: (code: string, language: string, filename?: string) => void;
  onCopy?: () => void;
  onRegenerate?: () => void;
  isStreaming?: boolean;
  messageIndex?: number;
  canRegenerate?: boolean;
};

export const MessageBubble = ({ message, provider, onCodeDetected, onCopy, onRegenerate, isStreaming, canRegenerate }: Props) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isUser = message.role === 'user';
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

  // Copy handler
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  }, [message.content, onCopy]);

  // Provider icon helper
  const getProviderIcon = (provider: AIProvider) => {
    const icons = {
      claude: '🧠',
      chatgpt: '🚀', 
      gemini: '💎'
    };
    return icons[provider] || '🤖';
  };

  return (
    <ErrorBoundary>
      <div 
        className={`message ${isUser ? 'message-user' : 'message-assistant'} ${isStreaming ? 'message-streaming' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Message Header */}
        <div className="message-header">
          <div className="message-author-info">
            <span className="message-author">
              {isUser ? '👤 Siz' : `${getProviderIcon(provider)} ${providerName}`}
            </span>
            {isStreaming && !isUser && (
              <span className="streaming-indicator">
                <span className="streaming-dot"></span>
                <span className="streaming-text">yazıyor...</span>
              </span>
            )}
          </div>
          <div className="message-actions">
            <span className="message-time">
              {new Date().toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {isHovered && (
              <div className="message-action-buttons">
                <button
                  onClick={handleCopy}
                  className="action-btn copy-btn"
                  title="Mesajı kopyala"
                >
                  {copied ? '✅' : '📋'}
                </button>
                {!isUser && canRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="action-btn regenerate-btn"
                    title="Yanıtı yeniden üret"
                  >
                    🔄
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="message-content">
          {isUser ? (
            <div className="user-message-content">
              {message.content}
            </div>
          ) : (
            <div className="assistant-message-content">
              <MarkdownMessage 
                content={message.content} 
                onCodeDetected={onCodeDetected} 
              />
            </div>
          )}
        </div>

        {/* Message Footer (if needed) */}
        {!isUser && message.content.length > 500 && (
          <div className="message-footer">
            <span className="message-stats">
              {message.content.length} karakter • {Math.ceil(message.content.split(' ').length)} kelime
            </span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};