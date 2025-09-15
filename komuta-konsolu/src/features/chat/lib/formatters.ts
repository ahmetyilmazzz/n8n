import { GeneratedFile } from '@/types/attachments';
import { detectFileType, generateFilename } from '@/features/files/lib/file-sniff';

export interface CodeBlockData {
  content: string;
  language: string;
  filename?: string;
}

export function extractCodeBlocks(content: string): CodeBlockData[] {
  const codeBlocks: CodeBlockData[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const codeContent = match[2].trim();
    
    if (codeContent && codeContent.length > 50) { // Sadece anlamlı kod bloklarını al
      const filename = generateFilename(language, codeContent);
      
      codeBlocks.push({
        content: codeContent,
        language,
        filename
      });
    }
  }

  return codeBlocks;
}

export function createGeneratedFile(codeBlock: CodeBlockData): GeneratedFile {
  const fileType = detectFileType(codeBlock.content, codeBlock.language);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: codeBlock.filename || `generated-${Date.now()}.${fileType}`,
    content: codeBlock.content,
    type: fileType,
    size: new Blob([codeBlock.content]).size,
    createdAt: new Date(),
  };
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function getProviderDisplayName(provider: string): string {
  const displayNames: Record<string, string> = {
    claude: 'Claude',
    chatgpt: 'ChatGPT',
    gemini: 'Gemini'
  };
  
  return displayNames[provider.toLowerCase()] || provider;
}

export function createCodeKey(code: string, language: string, filename?: string): string {
  return `${language || 'plain'}::${filename || 'noname'}::${code.length}::${code.slice(0, 50)}`;
}