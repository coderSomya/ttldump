// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DumpItem as DumpItemType } from './types';
import DumpForm from './components/DumpForm';
import DumpList from './components/DumpList';

export default function Home() {
  const [items, setItems] = useState<DumpItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/dump');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data.items.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        expiresAt: new Date(item.expiresAt),
      })));
      setError(null);
    } catch (e) {
      setError('Failed to load items. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    
    // Set up polling to refresh items every 15 seconds
    const interval = setInterval(fetchItems, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNewItem = () => {
    fetchItems();
  };

  return (
    <main className="ttldump-container">
      <header className="py-6 mb-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="ttldump-title">ttldump</h1>
        <p className="ttldump-subtitle">
          Temporary storage for your files and texts (10 minute TTL)
        </p>
      </header>
      
      <DumpForm onItemAdded={handleNewItem} />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Items</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : items.length === 0 ? (
          <p>No items found. Add something to get started!</p>
        ) : (
          <DumpList items={items} />
        )}
      </div>
    </main>
  );
}
