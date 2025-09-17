// src/components/attachments/UploadedFilesList.tsx
import { UploadedFile } from '@/lib/types';
import { formatFileSize } from '@/lib/utils';

type Props = {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
};

export const UploadedFilesList = ({ files, onRemoveFile }: Props) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('text/')) return '📄';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word')) return '📘';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  if (files.length === 0) return null;

  return (
    <div className="uploaded-files-list">
      {files.map((file) => (
        <div key={file.id} className="uploaded-file-item">
          <div className="file-info">
            <span className="file-icon">{getFileIcon(file.type)}</span>
            <div className="file-details">
              <span className="file-name">{file.name}</span>
              <span className="file-size">({formatFileSize(file.size)})</span>
            </div>
          </div>
          <button onClick={() => onRemoveFile(file.id)} className="remove-file-btn" type="button" title="Dosyayı kaldır">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};