import { Calendar, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { CollectionInfo } from '../lib/chromaClient';

interface TimelineItem {
  id: string;
  document: string;
  metadata: Record<string, unknown>;
  date: string;
}

interface TimelineViewProps {
  collection: CollectionInfo | null;
}

export function TimelineView({ collection }: TimelineViewProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 100;

  useEffect(() => {
    if (!collection) return;
    setLoading(true);
    fetch('/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: collection.name, offset, limit }),
    })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collection, offset]);

  if (!collection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Calendar size={40} className="text-[var(--accent)]/30 mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Select a collection to view timeline</p>
        </div>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, TimelineItem[]> = {};
  for (const item of items) {
    const d = item.date || 'Unknown';
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(item);
  }
  const dates = Object.keys(grouped).sort().reverse();

  const totalPages = Math.ceil(total / limit);
  const page = Math.floor(offset / limit);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-1">Timeline</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {total.toLocaleString()} memories ordered by date
          </p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!loading && dates.map((date) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-2 mb-3 sticky top-0 bg-[var(--bg-primary)] py-2 z-10">
              <Calendar size={14} className="text-[var(--accent-light)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{date}</h3>
              <span className="text-[10px] text-[var(--text-secondary)]">({grouped[date].length})</span>
            </div>
            <div className="space-y-2 ml-5 border-l border-[var(--border)] pl-4">
              {grouped[date].map((item) => {
                const source = (item.metadata?.source as string) || '';
                const section = (item.metadata?.section as string) || '';
                return (
                  <div key={item.id} className="glow-card bg-[var(--bg-card)] rounded-lg p-3 fade-in">
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap mb-2">
                      {(item.document || '').slice(0, 300)}{(item.document || '').length > 300 ? '…' : ''}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {source && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px]">
                          <Tag size={8} />{source}
                        </span>
                      )}
                      {section && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px]">
                          {section}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6 py-4">
            <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-[var(--text-secondary)]">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setOffset(offset + limit)} disabled={page >= totalPages - 1}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
