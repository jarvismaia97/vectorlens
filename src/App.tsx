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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 md:z-auto transition-transform duration-200`}>
        <Sidebar
          collections={collections}
          selected={selected}
          onSelect={(c) => { setSelected(c); setSidebarOpen(false); }}
          onRefresh={handleRefresh}
          connected={connected}
          view={view}
          onViewChange={(v) => { setView(v); setSidebarOpen(false); }}
          onStore={() => setStoreOpen(true)}
        />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-12 border-b border-[var(--border)] flex items-center px-4 md:px-6 justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]" onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
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
          </div>
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
