// src/types/index.ts
export type DumpItemType = 'text' | 'hashed_text' | 'image' | 'pdf' | 'file';

export interface DumpItem {
  id: string;
  type: DumpItemType;
  content: string;
  fileName?: string | null;
  mimeType?: string | null;
  createdAt: Date;
  expiresAt: Date;
  hashKey?: string; // For hashed text items
}

export interface CreateDumpItemPayload {
  type: DumpItemType;
  content: string;
  fileName?: string;
  mimeType?: string;
  hashKey?: string; // For hashed text items
}
