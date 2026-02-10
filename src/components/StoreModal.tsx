import { X, Plus, Loader } from 'lucide-react';
import { useState } from 'react';
import { useApi } from '../lib/useApi';

interface StoreModalProps {
  open: boolean;
  onClose: () => void;
  onStored: () => void;
}

export function StoreModal({ open, onClose, onStored }: StoreModalProps) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [section, setSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const api = useApi();

  if (!open) return null;

  const handleStore = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setResult(null);
    try {
      const data = await api.store({ text: text.trim(), source: source || undefined, section: section || undefined, date, tags: tags || undefined }) as Record<string, unknown>;
      if (data.success) {
        setResult({ success: true, message: `Stored as ${String(data.id || '').slice(0, 12)}… (${data.chunks} total chunks)` });
        setText('');
        setSource('');
        setSection('');
        setTags('');
        onStored();
      } else {
        setResult({ success: false, message: String(data.error || 'Failed to store') });
      }
    } catch {
      setResult({ success: false, message: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg mx-4 shadow-2xl fade-in">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Store New Memory</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Text *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
              placeholder="Memory content…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Source</label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                placeholder="e.g. session:direct"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Section</label>
              <input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                placeholder="e.g. conversation"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                placeholder="comma-separated"
              />
            </div>
          </div>

          {result && (
            <div className={`px-3 py-2 rounded-lg text-xs ${result.success ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
              {result.message}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border)] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
            Cancel
          </button>
          <button
            onClick={handleStore}
            disabled={saving || !text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-40"
          >
            {saving ? <Loader size={12} className="animate-spin" /> : <Plus size={12} />}
            {saving ? 'Storing…' : 'Store Memory'}
          </button>
        </div>
      </div>
    </div>
  );
}
