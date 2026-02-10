import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { CollectionInfo } from '../lib/chromaClient';
import { DocumentCard } from './DocumentCard';
import { SourceFilter } from './SourceFilter';
import { ExportButton } from './ExportButton';

interface SearchResult {
  ids: string[][];
  documents: (string | null)[][];
  metadatas: (Record<string, unknown> | null)[][];
  distances: number[][] | null;
}

interface SearchViewProps {
  collection: CollectionInfo | null;
}

async function semanticQuery(collection: string, query: string, nResults: number): Promise<SearchResult> {
  const res = await fetch('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, query, n_results: nResults }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function SearchView({ collection }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [nResults, setNResults] = useState(10);
  const [minScore, setMinScore] = useState(0.4);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!collection || !query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await semanticQuery(collection.name, query.trim(), nResults);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!collection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Sparkles size={40} className="text-[var(--accent)]/30 mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Select a collection to start searching</p>
        </div>
      </div>
    );
  }

  // Filter results
  const getFiltered = () => {
    if (!results) return [];
    return results.ids[0]
      .map((id, i) => ({ id, i }))
      .filter(({ i }) => {
        if (minScore > 0) {
          const dist = results.distances?.[0]?.[i];
          if (dist != null && (1 - dist) < minScore) return false;
        }
        if (sourceFilter.length > 0) {
          const src = (results.metadatas[0][i] as Record<string, unknown>)?.source as string || '';
          if (!sourceFilter.includes(src)) return false;
        }
        return true;
      });
  };

  const filtered = results ? getFiltered() : [];
  const exportItems = filtered.map(({ id, i }) => ({
    id,
    document: results!.documents[0][i] || '',
    metadata: (results!.metadatas[0][i] || {}) as Record<string, unknown>,
    score: results!.distances?.[0]?.[i],
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-1">Semantic Search</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Query <span className="text-[var(--accent-light)]">{collection.name}</span> using natural language
          </p>
        </div>

        <div className="glow-card bg-[var(--bg-card)] rounded-2xl p-1.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={16} className="text-[var(--text-secondary)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search memories, decisions, context…"
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 py-2.5"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <SlidersHorizontal size={12} className="text-[var(--text-secondary)]" />
          <label className="text-[10px] text-[var(--text-secondary)]">Results:</label>
          <select
            value={nResults}
            onChange={(e) => setNResults(Number(e.target.value))}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-2 py-1 text-[10px] text-[var(--text-primary)] outline-none"
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <label className="text-[10px] text-[var(--text-secondary)] ml-2">Min score:</label>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-2 py-1 text-[10px] text-[var(--text-primary)] outline-none"
          >
            {[0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((s) => (
              <option key={s} value={s}>{s === 0 ? 'Off' : `${(s * 100).toFixed(0)}%`}</option>
            ))}
          </select>

          <SourceFilter collection={collection.name} selected={sourceFilter} onChange={setSourceFilter} />

          {results && filtered.length > 0 && (
            <div className="ml-auto">
              <ExportButton items={exportItems} query={query} />
            </div>
          )}
        </div>

        {results && results.ids[0].length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
              {filtered.length} results {filtered.length < results.ids[0].length && `(${results.ids[0].length - filtered.length} filtered)`}
            </p>
            {filtered.map(({ id, i }) => (
              <DocumentCard
                key={id}
                id={id}
                document={results.documents[0][i] || ''}
                metadata={(results.metadatas[0][i] || {}) as Record<string, unknown>}
                score={results.distances?.[0]?.[i]}
                rank={i + 1}
              />
            ))}
          </div>
        )}

        {searched && results && results.ids[0].length === 0 && (
          <div className="text-center py-12">
            <Search size={32} className="text-[var(--text-secondary)]/30 mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}
