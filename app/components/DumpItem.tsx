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
      navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
     if (item.type !== 'text' && item.fileName) {
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
              {item.fileName || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Item`}
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
          {item.type !== 'text' && (
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
      <div className="mt-4">
             {item.type === 'text' && (
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