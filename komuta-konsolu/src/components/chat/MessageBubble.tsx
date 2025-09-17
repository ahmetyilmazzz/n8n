// src/components/chat/MessageBubble.tsx
import { Message } from 'ai/react';
import { AIProvider } from '@/lib/types';
import { MarkdownMessage } from './MarkdownMessage';

type Props = {
  message: Message;
  provider: AIProvider;
  onCodeDetected?: (code: string, language: string, filename?: string) => void;
};

export const MessageBubble = ({ message, provider, onCodeDetected }: Props) => {
  const isUser = message.role === 'user';
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  const author = isUser ? '👤 Siz' : `🤖 ${providerName}`;

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-header">
        <span className="message-author">{author}</span>
        <span className="message-time">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="message-content">
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <MarkdownMessage content={message.content} onCodeDetected={onCodeDetected} />
        )}
      </div>
    </div>
  );
};