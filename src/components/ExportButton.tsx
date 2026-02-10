import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportItem {
  id: string;
  document: string;
  metadata: Record<string, unknown>;
  score?: number;
}

interface ExportButtonProps {
  items: ExportItem[];
  query?: string;
}

export function ExportButton({ items, query }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const exportAs = (format: 'json' | 'markdown') => {
    let content: string;
    let filename: string;
    let mime: string;

    if (format === 'json') {
      content = JSON.stringify({ query, results: items }, null, 2);
      filename = `vectorlens-export-${Date.now()}.json`;
      mime = 'application/json';
    } else {
      const lines = [`# VectorLens Export`, query ? `\n**Query:** ${query}\n` : '', `**${items.length} results**\n`];
      for (const item of items) {
        lines.push(`---\n`);
        lines.push(`### ${item.id.slice(0, 16)}\n`);
        if (item.score != null) lines.push(`**Score:** ${Math.round((1 - item.score) * 100)}%\n`);
        const meta = Object.entries(item.metadata).map(([k, v]) => `${k}: ${v}`).join(' | ');
        if (meta) lines.push(`*${meta}*\n`);
        lines.push(`\n${item.document}\n`);
      }
      content = lines.join('\n');
      filename = `vectorlens-export-${Date.now()}.md`;
      mime = 'text/markdown';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <Download size={10} />
        Export
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
          <button onClick={() => exportAs('markdown')} className="block w-full px-4 py-2 text-xs text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
            Markdown (.md)
          </button>
          <button onClick={() => exportAs('json')} className="block w-full px-4 py-2 text-xs text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
            JSON (.json)
          </button>
        </div>
      )}
    </div>
  );
}
