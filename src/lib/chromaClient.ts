const API_BASE = '/api/v2';

export interface CollectionInfo {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
  count: number;
}

export interface ChunkDocument {
  id: string;
  document: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
  distance?: number;
}

export interface QueryResult {
  ids: string[][];
  documents: (string | null)[][];
  metadatas: (Record<string, unknown> | null)[][];
  distances: number[][] | null;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getHeartbeat() {
  return apiFetch('/heartbeat');
}

export async function listCollections(tenant = 'default_tenant', database = 'default_database'): Promise<string[]> {
  return apiFetch(`/tenants/${tenant}/databases/${database}/collections`).then(
    (cols: Array<{ name: string }>) => cols.map(c => c.name)
  );
}

export async function getCollection(name: string, tenant = 'default_tenant', database = 'default_database'): Promise<CollectionInfo> {
  const col = await apiFetch(`/tenants/${tenant}/databases/${database}/collections/${name}`);
  const countRes = await apiFetch(`/tenants/${tenant}/databases/${database}/collections/${col.id}/count`);
  return { ...col, count: countRes };
}

export async function getDocuments(
  collectionId: string,
  limit = 50,
  offset = 0,
  tenant = 'default_tenant',
  database = 'default_database'
): Promise<{ ids: string[]; documents: string[]; metadatas: Record<string, unknown>[] }> {
  return apiFetch(
    `/tenants/${tenant}/databases/${database}/collections/${collectionId}/get`,
    {
      method: 'POST',
      body: JSON.stringify({
        limit,
        offset,
        include: ['documents', 'metadatas'],
      }),
    }
  );
}

export async function getAllDocuments(
  collectionId: string,
  includeEmbeddings = false,
  tenant = 'default_tenant',
  database = 'default_database'
): Promise<{ ids: string[]; documents: string[]; metadatas: Record<string, unknown>[]; embeddings?: number[][] }> {
  const include = ['documents', 'metadatas'];
  if (includeEmbeddings) include.push('embeddings');
  return apiFetch(
    `/tenants/${tenant}/databases/${database}/collections/${collectionId}/get`,
    {
      method: 'POST',
      body: JSON.stringify({ include }),
    }
  );
}

export async function queryCollection(
  collectionId: string,
  queryText: string,
  nResults = 10,
  tenant = 'default_tenant',
  database = 'default_database'
): Promise<QueryResult> {
  return apiFetch(
    `/tenants/${tenant}/databases/${database}/collections/${collectionId}/query`,
    {
      method: 'POST',
      body: JSON.stringify({
        query_texts: [queryText],
        n_results: nResults,
        include: ['documents', 'metadatas', 'distances'],
      }),
    }
  );
}
