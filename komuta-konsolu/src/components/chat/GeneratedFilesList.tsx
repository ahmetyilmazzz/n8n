// src/components/chat/GeneratedFilesList.tsx
import { GeneratedFile } from '@/lib/types';
import { formatFileSize } from '@/lib/utils';

type Props = {
  files: GeneratedFile[];
  onViewFile: (file: GeneratedFile) => void;
};

export const GeneratedFilesList = ({ files, onViewFile }: Props) => {
  const getFileIcon = (type: GeneratedFile['type']) => {
    const icons: Record<GeneratedFile['type'], string> = {
      javascript: '⚡', typescript: '🔷', python: '🐍', css: '🎨',
      html: '🌐', json: '📋', txt: '📄', markdown: '📝',
      xml: '📄', sql: '🗃️', yaml: '⚙️'
    };
    return icons[type] || '📄';
  };

  if (files.length === 0) return null;

  return (
    <div className="generated-files-section">
      <h4 className="generated-files-title">📁 Oluşturulan Dosyalar</h4>
      <div className="generated-files-list">
        {files.map((file) => (
          <div key={file.id} className="generated-file-item" onClick={() => onViewFile(file)}>
            <div className="file-info">
              <span className="file-icon">{getFileIcon(file.type)}</span>
              <div className="file-details">
                <span className="file-name">{file.name}</span>
                <span className="file-meta">{file.type.toUpperCase()} • {formatFileSize(file.size)}</span>
              </div>
            </div>
            <button className="view-file-btn" title="Dosyayı görüntüle">👁️</button>
          </div>
        ))}
      </div>
    </div>
  );
};