
export interface StockMetadata {
  title: string;
  description: string;
  keywords: string[];
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  metadata?: StockMetadata;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}

export type ViewMode = 'upload' | 'editor' | 'history';
