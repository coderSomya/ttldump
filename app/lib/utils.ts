// src/app/lib/utils.ts
import { DumpItemType } from '../types';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Calculate expiration time (10 minutes from now)
export function getExpirationTime(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return expiresAt;
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  if (diffInSeconds < 0) {
    return 'Expired';
  }
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  return `${diffInMinutes} min ${diffInSeconds % 60} sec`;
}

// Get appropriate icon for file type
export function getIconForType(type: DumpItemType): string {
  switch (type) {
    case 'text':
      return '📝';
    case 'image':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'file':
      return '📎';
    default:
      return '📦';
  }
}

// Save uploaded file - client-side approach
export async function saveFile(file: File): Promise<string> {
  // For Next.js, we'll use the API route to handle file saving
  // Instead of using fs directly, we'll prepare the file for upload
  
  // Generate unique filename
  const uniqueFilename = `${uuidv4()}-${file.name}`;
  
  // Return a URL path that will be used by the API
  return `/uploads/${uniqueFilename}`;
}

// Detect file type from MIME type
export function detectFileType(mimeType: string): DumpItemType {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType === 'application/pdf') {
    return 'pdf';
  } else {
    return 'file';
  }
}