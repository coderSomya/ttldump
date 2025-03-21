// src/types/index.ts
export type DumpItemType = 'text' | 'image' | 'pdf' | 'file';

export interface DumpItem {
  id: string;
  type: DumpItemType;
  content: string;
  fileName?: string | null;
  mimeType?: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateDumpItemPayload {
  type: DumpItemType;
  content: string;
  fileName?: string;
  mimeType?: string;
}
