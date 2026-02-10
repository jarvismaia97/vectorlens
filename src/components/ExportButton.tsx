import { Download, FileJson, FileSpreadsheet, Loader } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ExportItem {
  id: string;
  document: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
  score?: number;
}

interface ExportButtonProps {
  /** Pre-loaded items (e.g. search results). If provided, exports these directly. */
  items?: ExportItem[];
  query?: string;
  /** Fetch all documents for collection-level export. Called with includeEmbeddings flag. */
  fetchAll?: (includeEmbeddings: boolean) => Promise<{
    ids: string[];
    documents: string[];
    metadatas: Record<string, unknown>[];
    embeddings?: number[][];
  }>;
  collectionName?: string;
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(items: ExportItem[]): string {
  // Collect all unique metadata keys
  const metaKeys = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item.metadata)) {
      metaKeys.add(key);
    }
  }
  const sortedKeys = [...metaKeys].sort();

  const headers = ['id', 'document', ...sortedKeys];
  const escape = (val: unknown): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map((item) => {
    const cells = [
      escape(item.id),
      escape(item.document),
      ...sortedKeys.map((k) => escape(item.metadata[k])),
    ];
    return cells.join(',');
  });

  return [headers.map(escape).join(','), ...rows].join('\n');
}

export function ExportButton({ items, query, fetchAll, collectionName }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [includeEmbeddings, setIncludeEmbeddings] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const resolveItems = async (): Promise<ExportItem[]> => {
    if (items) return items;
    if (!fetchAll) return [];
    setLoading(true);
    try {
      const data = await fetchAll(includeEmbeddings);
      return data.ids.map((id, i) => ({
        id,
        document: data.documents[i] || '',
        metadata: data.metadatas[i] || {},
        embedding: data.embeddings?.[i],
      }));
    } finally {
      setLoading(false);
    }
  };

  const exportAs = async (format: 'json' | 'csv') => {
    const resolved = await resolveItems();
    if (resolved.length === 0) return;

    const baseName = collectionName || 'vectorlens';
    const timestamp = Date.now();

    if (format === 'json') {
      const payload = resolved.map((item) => {
        const obj: Record<string, unknown> = {
          id: item.id,
          document: item.document,
          metadata: item.metadata,
        };
        if (includeEmbeddings && item.embedding) {
          obj.embedding = item.embedding;
        }
        return obj;
      });
      const content = JSON.stringify(query ? { query, results: payload } : payload, null, 2);
      triggerDownload(content, `${baseName}-${timestamp}.json`, 'application/json');
    } else {
      const content = toCsv(resolved);
      triggerDownload(content, `${baseName}-${timestamp}.csv`, 'text/csv');
    }
    setOpen(false);
  };

  // Hide if no data source
  if (!items?.length && !fetchAll) return null;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
      >
        {loading ? <Loader size={10} className="animate-spin" /> : <Download size={10} />}
        Export
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden min-w-[160px]">
          {fetchAll && (
            <label className="flex items-center gap-2 px-4 py-2 text-[10px] text-[var(--text-secondary)] border-b border-[var(--border)] cursor-pointer hover:bg-[var(--bg-tertiary)]">
              <input
                type="checkbox"
                checked={includeEmbeddings}
                onChange={(e) => setIncludeEmbeddings(e.target.checked)}
                className="rounded"
              />
              Include embeddings
            </label>
          )}
          <button
            onClick={() => exportAs('json')}
            className="flex items-center gap-2 w-full px-4 py-2 text-xs text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
          >
            <FileJson size={12} />
            JSON (.json)
          </button>
          <button
            onClick={() => exportAs('csv')}
            className="flex items-center gap-2 w-full px-4 py-2 text-xs text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
          >
            <FileSpreadsheet size={12} />
            CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}
