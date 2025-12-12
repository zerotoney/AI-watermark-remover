export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export interface ImageItem {
  id: string;
  original: string; // Base64
  processed: string | null; // Base64
  mimeType: string;
  status: ProcessingStatus;
  error: string | null;
  name: string;
}

export interface AppState {
  apiKey: string;
  images: ImageItem[];
  selectedId: string | null;
  isBatchProcessing: boolean;
}
