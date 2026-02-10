import { FileText, Tag, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface DocumentCardProps {
  id: string;
  document: string;
  metadata: Record<string, unknown>;
  score?: number;
  rank?: number;
}

export function DocumentCard({ id, document, metadata, score, rank }: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const source = metadata?.source as string || '';
  const section = metadata?.section as string || '';
  const preview = document.length > 200 && !expanded ? document.slice(0, 200) + '…' : document;

  const handleCopy = () => {
    navigator.clipboard.writeText(document);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const scorePercent = score != null ? Math.round((1 - score) * 100) : null;

  return (
    <div className="glow-card bg-[var(--bg-card)] rounded-xl p-4 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {rank != null && (
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)]/15 text-[var(--accent-light)] text-[10px] font-bold flex items-center justify-center">
              {rank}
            </span>
          )}
          <FileText size={14} className="flex-shrink-0 text-[var(--accent-light)]" />
          <span className="text-xs text-[var(--text-secondary)] truncate font-mono">{id.slice(0, 16)}…</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
          {document.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-md hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Score bar */}
      {scorePercent != null && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[var(--text-secondary)]">Relevance</span>
            <span className="text-[10px] font-medium text-[var(--accent-light)]">{scorePercent}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="score-bar h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Document content */}
      <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap mb-3">
        {preview}
      </p>

      {/* Metadata tags */}
      <div className="flex flex-wrap gap-1.5">
        {source && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px]">
            <Tag size={8} />
            {source}
          </span>
        )}
        {section && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px]">
            <Tag size={8} />
            {section}
          </span>
        )}
        {Object.entries(metadata)
          .filter(([k]) => !['source', 'section'].includes(k))
          .map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[var(--text-secondary)] text-[10px]">
              {k}: {String(v)}
            </span>
          ))}
      </div>
    </div>
  );
}
