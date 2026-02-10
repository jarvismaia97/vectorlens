// Hook that returns API functions — uses demo client when in demo mode, real fetch otherwise

import { useDemoMode } from './demoMode';
import {
  getHeartbeat,
  listCollections,
  getCollection,
  getDocuments,
  getAllDocuments,
  type QueryResult,
} from './chromaClient';
import {
  demoGetHeartbeat,
  demoListCollections,
  demoGetCollection,
  demoGetDocuments,
  demoQuery,
  demoTimeline,
  demoSources,
  demoDuplicates,
  demoGraph,
  demoCollections,
} from './demoClient';
import { useMemo } from 'react';

async function realProxyFetch(path: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useApi() {
  const { isDemo } = useDemoMode();

  const api = useMemo(() => ({
    getHeartbeat: isDemo ? demoGetHeartbeat : getHeartbeat,
    listCollections: isDemo ? demoListCollections : listCollections,
    getCollection: isDemo ? demoGetCollection : getCollection,
    getDocuments: isDemo
      ? (collectionId: string, limit?: number, offset?: number) => demoGetDocuments(collectionId, limit, offset)
      : (collectionId: string, limit?: number, offset?: number) => getDocuments(collectionId, limit, offset),

    getAllDocuments: isDemo
      ? (collectionId: string, _includeEmbeddings?: boolean) => demoGetDocuments(collectionId)
      : (collectionId: string, includeEmbeddings?: boolean) => getAllDocuments(collectionId, includeEmbeddings),

    query: isDemo
      ? (collection: string, query: string, nResults: number): Promise<QueryResult> =>
          demoQuery(collection, query, nResults)
      : (collection: string, query: string, nResults: number): Promise<QueryResult> =>
          realProxyFetch('/query', { collection, query, n_results: nResults }),

    timeline: isDemo
      ? (collection: string, offset: number, limit: number) =>
          demoTimeline(collection, offset, limit)
      : (collection: string, offset: number, limit: number) =>
          realProxyFetch('/timeline', { collection, offset, limit }),

    sources: isDemo
      ? (collection: string) => demoSources(collection)
      : (collection: string): Promise<string[]> =>
          realProxyFetch('/sources', { collection }),

    duplicates: isDemo
      ? (collection: string, threshold: number, _sampleSize: number) =>
          demoDuplicates(collection, threshold)
      : (collection: string, threshold: number, sampleSize: number) =>
          realProxyFetch('/duplicates', { collection, threshold, sample_size: sampleSize }),

    deleteDocs: isDemo
      ? (_collection: string, _ids: string[]) => Promise.resolve({ success: true })
      : (collection: string, ids: string[]) =>
          realProxyFetch('/delete', { collection, ids }),

    graph: isDemo
      ? (collection: string, sampleSize: number, threshold: number) =>
          demoGraph(collection, sampleSize, threshold)
      : (collection: string, sampleSize: number, threshold: number) =>
          realProxyFetch('/graph', { collection, sample_size: sampleSize, threshold }),

    collections: isDemo
      ? () => demoCollections()
      : () => realProxyFetch('/collections', {}),

    store: isDemo
      ? (_body: Record<string, unknown>) => Promise.resolve({ status: 'demo' })
      : (body: Record<string, unknown>) => realProxyFetch('/store', body),

    sync: isDemo
      ? () => Promise.resolve({ synced: 0 })
      : () => realProxyFetch('/sync', {}),
  }), [isDemo]);

  return api;
}
