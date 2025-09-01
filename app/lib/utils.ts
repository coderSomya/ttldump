// src/app/lib/utils.ts
import { DumpItemType } from '../types';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Calculate expiration time (10 minutes from now)
export function getExpirationTime(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return expiresAt;
}

// Encrypt text with a hash key (can be decrypted back)
export function encryptText(text: string, hashKey: string): string {
  const iv = crypto.randomBytes(16);
  // Use PBKDF2 to derive a proper key from the hashKey
  const key = crypto.pbkdf2Sync(hashKey, 'salt', 1000, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypt text with the same hash key
export function decryptText(encryptedText: string, hashKey: string): string | null {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) return null;
    
    const iv = Buffer.from(ivHex, 'hex');
    // Use PBKDF2 to derive the same key from the hashKey
    const key = crypto.pbkdf2Sync(hashKey, 'salt', 1000, 32, 'sha256');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return null; // Wrong key or corrupted data
  }
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
    case 'hashed_text':
      return '🔒';
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