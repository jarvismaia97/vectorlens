import { Layers, Search, Activity, RefreshCw, Check, AlertCircle, Clock, Plus, Copy, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export type ViewType = 'browse' | 'search' | 'timeline' | 'duplicates' | 'graph';

interface CollectionCount {
  name: string;
  count: number;
}

interface SidebarProps {
  collections: string[];
  selected: string | null;
  onSelect: (name: string) => void;
  onRefresh: () => void;
  connected: boolean;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onStore: () => void;
}

export function Sidebar({ collections, selected, onSelect, onRefresh, connected, view, onViewChange, onStore }: SidebarProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; summary: string; output?: string[] } | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [collectionCounts, setCollectionCounts] = useState<CollectionCount[]>([]);
  const [sources, setSources] = useState<Record<string, number>>({});
  const [sourcesOpen, setSourcesOpen] = useState(false);

  // Load collection counts
  useEffect(() => {
    fetch('/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then((r) => r.json())
      .then((data: CollectionCount[]) => setCollectionCounts(data))
      .catch(() => {});
  }, [collections]);

  // Load sources for selected collection
  useEffect(() => {
    if (!selected) return;
    fetch('/sources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collection: selected }) })
      .then((r) => r.json())
      .then((data) => setSources(data.sources || {}))
      .catch(() => {});
  }, [selected]);

  const getCount = (name: string) => collectionCounts.find((c) => c.name === name)?.count;

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      setSyncResult({ success: data.success, summary: data.summary, output: data.output });
      setLastSync(new Date().toLocaleTimeString());
      if (data.success) onRefresh();
    } catch {
      setSyncResult({ success: false, summary: 'Sync failed' });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 6000);
    }
  };

  const navItems: { id: ViewType; label: string; icon: typeof Layers }[] = [
    { id: 'browse', label: 'Browse', icon: Layers },
    { id: 'search', label: 'Semantic Search', icon: Search },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'duplicates', label: 'Duplicates', icon: Copy },
    { id: 'graph', label: 'Memory Graph', icon: GitBranch },
  ];

  const sourceList = Object.entries(sources).sort((a, b) => b[1] - a[1]);

  return (
    <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col h-screen">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">VectorLens</h1>
            <p className="text-[10px] text-[var(--text-secondary)]">Vector Database Explorer</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="text-[10px] text-[var(--text-secondary)]">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="p-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
              view === id
                ? 'bg-[var(--accent)]/10 text-[var(--accent-light)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}

        <button
          onClick={onStore}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <Plus size={14} />
          Store Memory
        </button>
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] px-3 mb-2">Collections</p>
        {collections.map((name) => {
          const count = getCount(name);
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                selected === name
                  ? 'bg-[var(--accent)]/15 text-[var(--accent-light)] border border-[var(--accent)]/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
              <span className="flex-1 text-left">{name}</span>
              {count != null && (
                <span className="text-[10px] opacity-60">{count.toLocaleString()}</span>
              )}
            </button>
          );
        })}

        {/* Sources collapsible */}
        {sourceList.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-1.5 px-3 mb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {sourcesOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              Sources ({sourceList.length})
            </button>
            {sourcesOpen && (
              <div className="space-y-0.5">
                {sourceList.map(([src, count]) => (
                  <div key={src} className="flex items-center gap-2 px-3 py-1 text-[10px] text-[var(--text-secondary)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50" />
                    <span className="flex-1 truncate">{src}</span>
                    <span className="opacity-60">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sync button */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-[var(--accent)]/20 text-[var(--accent-light)] hover:border-[var(--accent)]/40 hover:from-indigo-500/15 hover:to-purple-500/15 disabled:opacity-50"
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Re-sync Memory'}
        </button>
        {lastSync && !syncResult && (
          <p className="text-[10px] text-[var(--text-secondary)] text-center mt-1.5">Last: {lastSync}</p>
        )}
        {syncResult && (
          <div className={`flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-md text-[10px] fade-in ${
            syncResult.success
              ? 'bg-emerald-500/10 text-emerald-300'
              : 'bg-red-500/10 text-red-300'
          }`}>
            {syncResult.success ? <Check size={10} /> : <AlertCircle size={10} />}
            <span className="truncate">{syncResult.summary}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
          <Activity size={10} />
          <span>localhost:8000</span>
        </div>
      </div>
    </aside>
  );
}
