'use client';

import { useState } from 'react';
import { MarkdownRenderer } from '@/features/chat/lib/formatters';
import type { Message as MessageType } from '@/types/message';

interface MessageProps {
  message: MessageType;
  onCodeDetected?: (code: string, language: string, filename?: string) => void;
}

export function Message({ message, onCodeDetected }: MessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp || Date.now()).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Long message handling (>500 chars)
  const isLongMessage = message.content.length > 500;
  const shouldTruncate = isLongMessage && !isExpanded;
  const displayContent = shouldTruncate 
    ? message.content.slice(0, 500) + '...'
    : message.content;

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      {/* Avatar */}
      <div className="message-avatar">
        <span className="avatar-icon">
          {isUser ? '👤' : '🤖'}
        </span>
      </div>

      {/* Content */}
      <div className="message-content">
        {/* Header */}
        <div className="message-header">
          <span className="message-author">
            {isUser ? 'Siz' : 'AI'}
          </span>
          <span className="message-timestamp">{timestamp}</span>
        </div>

        {/* Body */}
        <div className="message-body">
          {isUser ? (
            // User messages - plain text
            <div className="user-message-text">
              {displayContent}
              {shouldTruncate && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="expand-button"
                >
                  Daha fazla göster
                </button>
              )}
            </div>
          ) : (
            // Assistant messages - markdown with code detection
            <div className="assistant-message-text">
              <MarkdownRenderer
                content={displayContent}
                onCodeDetected={onCodeDetected}
              />
              {shouldTruncate && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="expand-button"
                >
                  Tamamını göster
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="message-actions">
          {!isUser && (
            <>
              <button 
                className="action-button"
                onClick={() => navigator.clipboard.writeText(message.content)}
                title="Kopyala"
              >
                📋
              </button>
              <button 
                className="action-button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Kısalt" : "Genişlet"}
              >
                {isExpanded ? "⬆️" : "⬇️"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}