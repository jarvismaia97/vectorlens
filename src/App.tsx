import { useState, useEffect, useCallback } from 'react';
import { Sidebar, type ViewType } from './components/Sidebar';
import { BrowseView } from './components/BrowseView';
import { SearchView } from './components/SearchView';
import { TimelineView } from './components/TimelineView';
import { DuplicatesView } from './components/DuplicatesView';
import { MemoryGraph } from './components/MemoryGraph';
import { StoreModal } from './components/StoreModal';
import { listCollections, getCollection, getHeartbeat, type CollectionInfo } from './lib/chromaClient';

function App() {
  const [collections, setCollections] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [collection, setCollection] = useState<CollectionInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<ViewType>('browse');
  const [refreshKey, setRefreshKey] = useState(0);
  const [storeOpen, setStoreOpen] = useState(false);

  const loadCollections = useCallback(() => {
    getHeartbeat()
      .then(() => {
        setConnected(true);
        return listCollections();
      })
      .then((cols) => {
        setCollections(cols);
        if (cols.length > 0 && !selected) setSelected(cols[0]);
      })
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  useEffect(() => {
    if (!selected) return;
    getCollection(selected).then(setCollection);
  }, [selected, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    loadCollections();
  };

  // Set initial theme
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collections={collections}
        selected={selected}
        onSelect={setSelected}
        onRefresh={handleRefresh}
        connected={connected}
        view={view}
        onViewChange={setView}
        onStore={() => setStoreOpen(true)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-[var(--border)] flex items-center px-6 justify-between">
          <h2 className="text-sm font-medium">
            {selected ? (
              <>
                <span className="text-[var(--text-secondary)]">collection / </span>
                <span className="text-[var(--text-primary)]">{selected}</span>
              </>
            ) : (
              <span className="text-[var(--text-secondary)]">No collection selected</span>
            )}
          </h2>
          {collection && (
            <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-md">
              {collection.count} chunks
            </span>
          )}
        </header>

        {view === 'browse' && <BrowseView collection={collection} key={`browse-${refreshKey}`} />}
        {view === 'search' && <SearchView collection={collection} />}
        {view === 'timeline' && <TimelineView collection={collection} />}
        {view === 'duplicates' && <DuplicatesView collection={collection} onRefresh={handleRefresh} />}
        {view === 'graph' && <MemoryGraph collection={collection} />}
      </main>

      <StoreModal open={storeOpen} onClose={() => setStoreOpen(false)} onStored={handleRefresh} />
    </div>
  );
}

export default App;
