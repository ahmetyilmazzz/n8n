// src/components/chat/MarkdownMessage.tsx
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '../ui/CodeBlock';

type Props = {
  content: string;
  onCodeDetected?: (code: string, language: string, filename?: string) => void;
};

// Bu bileşen sadece AI mesajlarının içeriğini render etmek için özelleştirildi.
export const MarkdownMessage = ({ content, onCodeDetected }: Props) => {
  return (
    <ReactMarkdown
      components={{
        code: ({ node, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const isInline = !className || !className.startsWith('language-');
          const codeContent = String(children).replace(/\n$/, '');
          
          if (isInline) {
            return <code className="inline-code" {...props}>{children}</code>;
          }

          if (onCodeDetected && codeContent.length > 50) {
            const extensions: Record<string, string> = {
              javascript: '.js', typescript: '.ts', python: '.py', css: '.css',
              html: '.html', json: '.json', markdown: '.md', xml: '.xml',
              sql: '.sql', yaml: '.yml'
            };
            const filename = `generated-code${extensions[language] || '.txt'}`;
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
        p: ({ children }) => <p className="paragraph">{children}</p>,
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