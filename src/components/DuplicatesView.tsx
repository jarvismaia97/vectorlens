import { Copy, Trash2, Loader, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { CollectionInfo } from '../lib/chromaClient';
import { useApi } from '../lib/useApi';

interface DupGroup {
  anchor: { id: string; document: string; metadata: Record<string, unknown> };
  similar: { id: string; document: string; metadata: Record<string, unknown>; distance: number }[];
}

interface DuplicatesViewProps {
  collection: CollectionInfo | null;
  onRefresh: () => void;
}

export function DuplicatesView({ collection, onRefresh }: DuplicatesViewProps) {
  const [groups, setGroups] = useState<DupGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(0);
  const [threshold, setThreshold] = useState(0.08);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [searched, setSearched] = useState(false);
  const api = useApi();

  const scan = async () => {
    if (!collection) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.duplicates(collection.name, threshold, 300);
      setGroups(data.duplicates || []);
      setScanned(data.scanned || 0);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!collection) return;
    setDeleting((prev) => new Set(prev).add(id));
    try {
      await api.deleteDocs(collection.name, [id]);
      // Remove from groups
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          similar: g.similar.filter((s) => s.id !== id),
        })).filter((g) => g.similar.length > 0 || g.anchor.id !== id)
      );
      onRefresh();
    } catch {
      // ignore
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (!collection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Copy size={40} className="text-[var(--accent)]/30 mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Select a collection to find duplicates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-1">Duplicate Detection</h2>
          <p className="text-xs text-[var(--text-secondary)]">Find and remove similar chunks</p>
        </div>

        <div className="flex items-center gap-3 mb-6 justify-center">
          <label className="text-[10px] text-[var(--text-secondary)]">Threshold:</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-2 py-1 text-[10px] text-[var(--text-primary)] outline-none"
          >
            <option value={0.05}>Very strict (5%)</option>
            <option value={0.08}>Strict (8%)</option>
            <option value={0.1}>Normal (10%)</option>
            <option value={0.15}>Loose (15%)</option>
          </select>
          <button
            onClick={scan}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-40"
          >
            {loading ? <Loader size={12} className="animate-spin" /> : <Copy size={12} />}
            {loading ? 'Scanning…' : 'Scan for Duplicates'}
          </button>
        </div>

        {searched && !loading && (
          <p className="text-[10px] text-[var(--text-secondary)] text-center mb-4">
            Scanned {scanned} chunks — found {groups.length} duplicate group{groups.length !== 1 ? 's' : ''}
          </p>
        )}

        {groups.map((group, gi) => (
          <div key={gi} className="glow-card bg-[var(--bg-card)] rounded-xl p-4 mb-4 fade-in">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={14} className="text-[var(--warning)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] text-[var(--text-secondary)] mb-1">Anchor: {group.anchor.id.slice(0, 16)}</p>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  {group.anchor.document.slice(0, 200)}{group.anchor.document.length > 200 ? '…' : ''}
                </p>
              </div>
            </div>

            <div className="ml-5 space-y-2 border-l border-[var(--border)] pl-3">
              {group.similar.map((sim) => (
                <div key={sim.id} className="flex items-start gap-2 bg-[var(--bg-primary)] rounded-lg p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">{sim.id.slice(0, 16)}</span>
                      <span className="text-[10px] text-[var(--accent-light)]">
                        {Math.round((1 - sim.distance) * 100)}% similar
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                      {sim.document.slice(0, 200)}{sim.document.length > 200 ? '…' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(sim.id)}
                    disabled={deleting.has(sim.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors disabled:opacity-40"
                    title="Delete this chunk"
                  >
                    {deleting.has(sim.id) ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {searched && !loading && groups.length === 0 && (
          <div className="text-center py-12">
            <Copy size={32} className="text-[var(--text-secondary)]/30 mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">No duplicates found</p>
          </div>
        )}
      </div>
    </div>
  );
}
