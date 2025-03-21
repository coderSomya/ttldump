// src/app/components/DumpForm.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DumpItemType } from '../types';

interface DumpFormProps {
  onItemAdded: () => void;
}

export default function DumpForm({ onItemAdded }: DumpFormProps) {
  const [type, setType] = useState<DumpItemType>('text');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('type', type);

      if (type === 'text') {
        if (!textContent.trim()) {
          throw new Error('Text content cannot be empty');
        }
        formData.append('content', textContent);
      } else {
        if (!file) {
          throw new Error('No file selected');
        }
        formData.append('file', file);
      }

      const response = await fetch('/api/dump', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create dump item');
      }

      // Reset form
      setTextContent('');
      setFile(null);
      setSuccess(true);
      
      // Notify parent
      onItemAdded();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ttldump-card">
      <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Type</label>
          <div className="ttldump-type-selector">
            {['text', 'image', 'pdf', 'file'].map((itemType) => (
              <Button
                key={itemType}
                type="button"
                variant={type === itemType ? 'default' : 'outline'}
                onClick={() => setType(itemType as DumpItemType)}
              >
                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {type === 'text' ? (
          <div className="mb-4">
            <label htmlFor="content" className="block mb-2 text-sm font-medium">
              Content
            </label>
            <textarea
              id="content"
              className="ttldump-input"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter your text here..."
              rows={5}
            />
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="file" className="block mb-2 text-sm font-medium">
              File
            </label>
            <Input
              id="file"
              type="file"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setFile(files[0]);
                }
              }}
              accept={
                type === 'image'
                  ? 'image/*'
                  : type === 'pdf'
                  ? 'application/pdf'
                  : undefined
              }
            />
            {file && (
              <p className="mt-2 text-sm">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 mb-4">Item added successfully!</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2"
        >
          {isSubmitting ? 'Adding...' : 'Add to Dump'}
        </Button>
      </form>
    </div>
  );
}