import { useState, useEffect, useCallback } from 'react';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CollectionInfo } from '../lib/chromaClient';
import { DocumentCard } from './DocumentCard';
import { StatsBar } from './StatsBar';
import { ExportButton } from './ExportButton';
import { useApi } from '../lib/useApi';

interface BrowseViewProps {
  collection: CollectionInfo | null;
}

export function BrowseView({ collection }: BrowseViewProps) {
  const [docs, setDocs] = useState<{ ids: string[]; documents: string[]; metadatas: Record<string, unknown>[] } | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 20;
  const api = useApi();

  useEffect(() => {
    if (!collection) return;
    setLoading(true);
    setPage(0);
    api.getDocuments(collection.id, pageSize, 0)
      .then(setDocs)
      .finally(() => setLoading(false));
  }, [collection, api]);

  const loadPage = async (p: number) => {
    if (!collection) return;
    setLoading(true);
    setPage(p);
    const res = await api.getDocuments(collection.id, pageSize, p * pageSize);
    setDocs(res);
    setLoading(false);
  };

  if (!collection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Layers size={40} className="text-[var(--accent)]/30 mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Select a collection to browse</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(collection.count / pageSize);

  const fetchAll = useCallback(
    (includeEmbeddings: boolean) => api.getAllDocuments(collection.id, includeEmbeddings),
    [api, collection.id]
  );

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1"><StatsBar collection={collection} /></div>
        <div className="pt-1 shrink-0"><ExportButton fetchAll={fetchAll} collectionName={collection.name} /></div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {docs && !loading && (
        <>
          <div className="space-y-3">
            {docs.ids.map((id, i) => (
              <DocumentCard
                key={id}
                id={id}
                document={docs.documents[i] || ''}
                metadata={docs.metadatas[i] || {}}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6 py-4">
              <button
                onClick={() => loadPage(page - 1)}
                disabled={page === 0}
                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-[var(--text-secondary)]">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => loadPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
