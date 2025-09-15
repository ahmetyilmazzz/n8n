export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
}

export interface GeneratedFile {
  id: string;
  name: string;
  content: string;
  type:
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'css'
    | 'html'
    | 'json'
    | 'txt'
    | 'markdown'
    | 'xml'
    | 'sql'
    | 'yaml';
  size: number;
  createdAt: Date;
}

export interface AttachmentOption {
  icon: string;
  title: string;
  subtitle: string;
  action: 'image' | 'file' | 'paste' | 'clipboard';
}

export const DEFAULT_ATTACHMENT_OPTIONS: AttachmentOption[] = [
  {
    icon: '🖼️',
    title: 'Resim ekle',
    subtitle: 'Resim dosyalarını yükleyin',
    action: 'image'
  },
  {
    icon: '📎',
    title: 'Dosya yükle',
    subtitle: 'Dokuman, PDF, vb.',
    action: 'file'
  },
  {
    icon: '📸',
    title: 'Ekran görüntüsü yapıştır',
    subtitle: 'Win+Shift+S ile alınan görüntü',
    action: 'paste'
  }
];