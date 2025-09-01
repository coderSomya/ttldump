// src/app/components/DumpItem.tsx
'use client';

import { useState, useEffect } from 'react';
import { DumpItem as DumpItemType } from '../types';
import { formatRelativeTime, getIconForType } from '@/app/lib/utils';
import { Button } from './ui/Button';
import Image from 'next/image';

interface DumpItemProps {
  item: DumpItemType;
}

export default function DumpItem({ item }: DumpItemProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHashInput, setShowHashInput] = useState(false);
  const [hashKey, setHashKey] = useState('');
  const [hashError, setHashError] = useState('');

  useEffect(() => {
    // Update time left
    const updateTimeLeft = () => {
      setTimeLeft(formatRelativeTime(item.expiresAt));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [item.expiresAt]);

  const handleCopy = () => {
    if (item.type === 'text') {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(item.content);
      } else {
        // Fallback: create a temporary textarea and copy
        const textArea = document.createElement('textarea');
        textArea.value = item.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyWithHash = async () => {
    if (!hashKey.trim()) {
      setHashError('Hash key is required');
      return;
    }

    try {
      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          hashKey: hashKey,
          itemId: item.id 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error gracefully instead of throwing
        setHashError(data.error || 'Failed to decode text');
        return;
      }

      // Copy the decoded text with fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data.decodedText);
      } else {
        // Fallback: create a temporary textarea and copy
        const textArea = document.createElement('textarea');
        textArea.value = data.decodedText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      setShowHashInput(false);
      setHashKey('');
      setHashError('');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (e: any) {
      setHashError('Network error or invalid response');
    }
  };

  const handleDownload = () => {
     if (item.type !== 'text' && item.type !== 'hashed_text' && item.fileName) {
       // Create an anchor element and simulate a click to download the file
       const link = document.createElement('a');
       link.href = item.content; // This is already a data URL
       link.download = item.fileName;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     }
   };

  return (
    <div className="ttldump-card">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="ttldump-type-icon" role="img" aria-label={item.type}>
            {getIconForType(item.type)}
          </span>
          <div>
            <h3 className="font-medium text-base mb-1">
              {item.fileName || `${item.type === 'hashed_text' ? 'Hashed Text' : item.type.charAt(0).toUpperCase() + item.type.slice(1)} Item`}
            </h3>
            <p className="ttldump-meta">
              Expires in {timeLeft} • Added {item.createdAt.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {item.type === 'text' && (
            <Button
              onClick={handleCopy}
              variant="outline"
              className="ttldump-action-button"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}
          {item.type === 'hashed_text' && (
            <Button
              onClick={() => setShowHashInput(!showHashInput)}
              variant="outline"
              className="ttldump-action-button"
            >
              {copied ? 'Copied!' : 'Copy with Hash'}
            </Button>
          )}
          {item.type !== 'text' && item.type !== 'hashed_text' && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="ttldump-action-button"
            >
              Download
            </Button>
          )}
        </div>
      </div>
      
      {item.type === 'hashed_text' && showHashInput && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
          <div className="flex gap-2">
            <input
              type="text"
              value={hashKey}
              onChange={(e) => setHashKey(e.target.value)}
              placeholder="Enter hash key..."
              className="ttldump-input flex-1"
            />
            <Button
              onClick={handleCopyWithHash}
              className="px-3 py-1"
            >
              Copy
            </Button>
          </div>
          {hashError && (
            <p className="text-red-500 text-sm mt-1">{hashError}</p>
          )}
        </div>
      )}
      
      <div className="mt-4">
             {item.type === 'text' && (
               <div className="ttldump-text-content">
                 <pre className="whitespace-pre-wrap break-words m-0">
                   {item.content}
                 </pre>
               </div>
             )}
             {item.type === 'hashed_text' && (
               <div className="ttldump-text-content">
                 <pre className="whitespace-pre-wrap break-words m-0">
                   {item.content}
                 </pre>
               </div>
             )}
             {item.type === 'image' && (
               <div className="ttldump-image-container">
                 <img
                   src={item.content} // This is a data URL now
                   alt={item.fileName || 'Image'}
                   className="ttldump-image"
                 />
               </div>
             )}
             {item.type === 'pdf' && (
               <div className="ttldump-file-container">
                 <p className="mb-2 font-medium">PDF Document</p>
                 <a
                   href={item.content} // This is a data URL
                   target="_blank"
                   rel="noopener noreferrer"
                   className="underline hover:opacity-80"
                 >
                   Open PDF
                 </a>
               </div>
             )}
             {item.type === 'file' && (
               <div className="ttldump-file-container">
                 <p className="mb-2 font-medium">
                   {item.fileName} 
                 </p>
                 <p className="text-sm opacity-70">
                   {item.mimeType}
                 </p>
               </div>
             )}
           </div>
    </div>
  );
}