import { Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SourceFilterProps {
  collection: string;
  selected: string[];
  onChange: (sources: string[]) => void;
}

export function SourceFilter({ collection, selected, onChange }: SourceFilterProps) {
  const [sources, setSources] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection }),
    })
      .then((r) => r.json())
      .then((data) => setSources(data.sources || {}))
      .catch(() => {});
  }, [collection]);

  const sourceList = Object.entries(sources).sort((a, b) => b[1] - a[1]);

  const toggle = (src: string) => {
    onChange(selected.includes(src) ? selected.filter((s) => s !== src) : [...selected, src]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] border transition-colors ${
          selected.length > 0
            ? 'border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent-light)]'
            : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >
        <Filter size={10} />
        Sources{selected.length > 0 && ` (${selected.length})`}
      </button>

      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="ml-1 p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
        >
          <X size={10} />
        </button>
      )}

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-72 max-h-64 overflow-y-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl p-2">
          {sourceList.map(([src, count]) => (
            <label
              key={src}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer text-xs"
            >
              <input
                type="checkbox"
                checked={selected.includes(src)}
                onChange={() => toggle(src)}
                className="rounded accent-[var(--accent)]"
              />
              <span className="flex-1 text-[var(--text-primary)] truncate">{src}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">{count}</span>
            </label>
          ))}
          {sourceList.length === 0 && (
            <p className="text-[10px] text-[var(--text-secondary)] px-2 py-1">Loading…</p>
          )}
        </div>
      )}
    </div>
  );
}
