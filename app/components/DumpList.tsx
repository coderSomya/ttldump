// src/app/components/DumpList.tsx
import { DumpItem as DumpItemType } from '../types';
import DumpItem from './DumpItem';

interface DumpListProps {
  items: DumpItemType[];
}

export default function DumpList({ items }: DumpListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <DumpItem key={item.id} item={item} />
      ))}
    </div>
  );
}