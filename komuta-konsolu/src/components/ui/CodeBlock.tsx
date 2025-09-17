// src/components/ui/CodeBlock.tsx
'use client';
import { useState } from 'react';

type Props = {
  children: string;
  language?: string;
};

export const CodeBlock = ({ children, language = '' }: Props) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, string> = {
      python: '🐍', javascript: '⚡', typescript: '🔷', csharp: '💜',
      java: '☕', html: '🌐', css: '🎨', bash: '💻',
      shell: '💻', sql: '🗃️', json: '📋', xml: '📄',
    };
    return icons[lang.toLowerCase()] || '📄';
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="language-tag">
          {getLanguageIcon(language)} {language.toLowerCase() || 'kod'}
        </div>
        <button onClick={copyToClipboard} className="copy-btn">
          {copied ? '✅ Kopyalandı' : '📋 Kopyala'}
        </button>
      </div>
      <pre className="code-content">
        <code>{children}</code>
      </pre>
    </div>
  );
};