// Demo client that serves local sample data when no ChromaDB backend is available

import { DEMO_COLLECTIONS, type DemoDocument } from './demoData';
import type { CollectionInfo, QueryResult } from './chromaClient';

export function demoGetHeartbeat(): Promise<Record<string, number>> {
  return Promise.resolve({ 'nanosecond heartbeat': Date.now() * 1e6 });
}

export function demoListCollections(): Promise<string[]> {
  return Promise.resolve(DEMO_COLLECTIONS.map((c) => c.name));
}

export function demoGetCollection(name: string): Promise<CollectionInfo> {
  const col = DEMO_COLLECTIONS.find((c) => c.name === name);
  if (!col) return Promise.reject(new Error(`Collection ${name} not found`));
  return Promise.resolve({
    id: col.id,
    name: col.name,
    metadata: col.metadata,
    count: col.documents.length,
  });
}

export function demoGetDocuments(
  collectionId: string,
  limit = 50,
  offset = 0
): Promise<{ ids: string[]; documents: string[]; metadatas: Record<string, unknown>[] }> {
  const col = DEMO_COLLECTIONS.find((c) => c.id === collectionId);
  if (!col) return Promise.resolve({ ids: [], documents: [], metadatas: [] });
  const slice = col.documents.slice(offset, offset + limit);
  return Promise.resolve({
    ids: slice.map((d) => d.id),
    documents: slice.map((d) => d.document),
    metadatas: slice.map((d) => d.metadata),
  });
}

function fuzzyMatch(doc: string, query: string): number {
  const docLower = doc.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 1;
  let matchCount = 0;
  for (const term of terms) {
    if (docLower.includes(term)) matchCount++;
  }
  const ratio = matchCount / terms.length;
  // Convert to a distance-like score (lower = more similar)
  return Math.max(0.01, 1 - ratio * 0.9) * (0.8 + Math.random() * 0.2);
}

export function demoQueryCollection(
  collectionName: string,
  queryText: string,
  nResults = 10
): Promise<QueryResult> {
  const col = DEMO_COLLECTIONS.find((c) => c.name === collectionName || c.id === collectionName);
  if (!col) return Promise.resolve({ ids: [[]], documents: [[]], metadatas: [[]], distances: [[]] });

  const scored = col.documents.map((d) => ({
    ...d,
    distance: fuzzyMatch(d.document + ' ' + JSON.stringify(d.metadata), queryText),
  }));
  scored.sort((a, b) => a.distance - b.distance);
  const top = scored.slice(0, nResults);

  return Promise.resolve({
    ids: [top.map((d) => d.id)],
    documents: [top.map((d) => d.document)],
    metadatas: [top.map((d) => d.metadata)],
    distances: [top.map((d) => d.distance)],
  });
}

// Proxy endpoint equivalents for demo mode

export function demoQuery(collection: string, query: string, nResults: number): Promise<QueryResult> {
  return demoQueryCollection(collection, query, nResults);
}

export function demoTimeline(
  collectionName: string,
  offset: number,
  limit: number
): Promise<{ items: Array<{ id: string; document: string; metadata: Record<string, unknown>; date: string }>; total: number }> {
  const col = DEMO_COLLECTIONS.find((c) => c.name === collectionName);
  if (!col) return Promise.resolve({ items: [], total: 0 });

  const withDates = col.documents.map((d) => ({
    id: d.id,
    document: d.document,
    metadata: d.metadata,
    date: typeof d.metadata.timestamp === 'string' ? d.metadata.timestamp.split('T')[0] : 'Unknown',
  }));
  withDates.sort((a, b) => b.date.localeCompare(a.date));
  return Promise.resolve({
    items: withDates.slice(offset, offset + limit),
    total: withDates.length,
  });
}

export function demoSources(collectionName: string): Promise<string[]> {
  const col = DEMO_COLLECTIONS.find((c) => c.name === collectionName);
  if (!col) return Promise.resolve([]);
  const sources = new Set(col.documents.map((d) => String(d.metadata.source || 'unknown')));
  return Promise.resolve([...sources].sort());
}

export function demoDuplicates(
  collectionName: string,
  _threshold: number
): Promise<{ duplicates: Array<{ anchor: DemoDocument; similar: Array<DemoDocument & { distance: number }> }>; scanned: number }> {
  const col = DEMO_COLLECTIONS.find((c) => c.name === collectionName);
  if (!col) return Promise.resolve({ duplicates: [], scanned: 0 });

  // Simulate finding one duplicate pair in agent memories
  if (collectionName === 'ai-agent-memories' && col.documents.length >= 2) {
    return Promise.resolve({
      duplicates: [{
        anchor: col.documents[0],
        similar: [{ ...col.documents[5], distance: 0.05 }],
      }],
      scanned: col.documents.length,
    });
  }
  return Promise.resolve({ duplicates: [], scanned: col.documents.length });
}

export function demoGraph(
  collectionName: string,
  sampleSize: number,
  threshold: number
): Promise<{
  nodes: Array<{ id: string; label: string; source: string; date: string }>;
  links: Array<{ source: string; target: string; distance: number }>;
}> {
  const col = DEMO_COLLECTIONS.find((c) => c.name === collectionName);
  if (!col) return Promise.resolve({ nodes: [], links: [] });

  const docs = col.documents.slice(0, sampleSize);
  const nodes = docs.map((d) => ({
    id: d.id,
    label: d.document.slice(0, 60),
    source: String(d.metadata.source || 'unknown'),
    date: typeof d.metadata.timestamp === 'string' ? d.metadata.timestamp.split('T')[0] : '',
  }));

  // Create some links between related documents
  const links: Array<{ source: string; target: string; distance: number }> = [];
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const tagsA = String(docs[i].metadata.tags || '').split(',');
      const tagsB = String(docs[j].metadata.tags || '').split(',');
      const overlap = tagsA.filter((t) => tagsB.includes(t)).length;
      if (overlap > 0) {
        const dist = 0.05 + (1 - overlap / Math.max(tagsA.length, tagsB.length)) * 0.1;
        if (dist < threshold) {
          links.push({ source: docs[i].id, target: docs[j].id, distance: dist });
        }
      }
    }
  }

  return Promise.resolve({ nodes, links });
}

export function demoCollections(): Promise<Array<{ name: string; count: number; sources: string[] }>> {
  return Promise.resolve(
    DEMO_COLLECTIONS.map((c) => ({
      name: c.name,
      count: c.documents.length,
      sources: [...new Set(c.documents.map((d) => String(d.metadata.source || 'unknown')))],
    }))
  );
}
