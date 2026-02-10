import { Hash, FileText, Box, Clock } from 'lucide-react';
import type { CollectionInfo } from '../lib/chromaClient';

interface StatsBarProps {
  collection: CollectionInfo | null;
}

export function StatsBar({ collection }: StatsBarProps) {
  if (!collection) return null;

  const stats = [
    { icon: Hash, label: 'Collection ID', value: collection.id.slice(0, 12) + '…' },
    { icon: FileText, label: 'Total Chunks', value: collection.count.toLocaleString() },
    { icon: Box, label: 'Embedding Space', value: (collection.metadata?.['hnsw:space'] as string) || 'cosine' },
    { icon: Clock, label: 'Name', value: collection.name },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="glow-card bg-[var(--bg-card)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Icon size={12} className="text-[var(--accent-light)]" />
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{value}</p>
        </div>
      ))}
    </div>
  );
}
