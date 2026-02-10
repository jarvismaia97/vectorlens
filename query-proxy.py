#!/usr/bin/env python3
"""Proxy: semantic search + sync + store for ChromaDB Viewer."""
import hashlib
import json
import subprocess
import sys
import time
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import chromadb

client = chromadb.HttpClient(host='localhost', port=8000)
MIGRATE_SCRIPT = Path.home() / 'openclaw' / 'scripts' / 'chromadb' / 'migrate_ollama.py'
COLLECTION_NAME = 'jarvis-memory'
OLLAMA_URL = 'http://localhost:11434'
EMBEDDING_MODEL = 'nomic-embed-text'

def get_embedding(text: str) -> list[float]:
    truncated = text[:2000] if len(text) > 2000 else text
    data = json.dumps({"model": EMBEDDING_MODEL, "prompt": truncated}).encode()
    req = urllib.request.Request(f"{OLLAMA_URL}/api/embeddings", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())["embedding"]

print("Connected to ChromaDB", flush=True)


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length)) if length else {}

        if self.path == '/query':
            col_name = body.get('collection', COLLECTION_NAME)
            query_text = body.get('query', '')
            n_results = body.get('n_results', 10)
            try:
                col = client.get_collection(col_name)
                embedding = get_embedding(query_text)
                results = col.query(
                    query_embeddings=[embedding],
                    n_results=n_results,
                    include=['documents', 'metadatas', 'distances']
                )
                self._json_response(200, results)
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        elif self.path == '/store':
            # Store a memory in ChromaDB
            text = body.get('text', '')
            source = body.get('source', 'jarvis-live')
            section = body.get('section', '')
            date = body.get('date', time.strftime('%Y-%m-%d'))
            tags = body.get('tags', '')

            if not text:
                self._json_response(400, {'error': 'text is required'})
                return

            try:
                col = client.get_or_create_collection(
                    name=COLLECTION_NAME,
                    metadata={"hnsw:space": "cosine"},
                )
                chunk_id = hashlib.md5(f"{source}:{section}:{text[:50]}:{date}".encode()).hexdigest()
                metadata = {
                    "source": source,
                    "section": section or "memory",
                    "date": date,
                }
                if tags:
                    metadata["tags"] = tags

                embedding = get_embedding(text)
                col.upsert(
                    documents=[text],
                    ids=[chunk_id],
                    embeddings=[embedding],
                    metadatas=[metadata],
                )
                self._json_response(200, {
                    'success': True,
                    'id': chunk_id,
                    'collection': COLLECTION_NAME,
                    'chunks': col.count()
                })
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        elif self.path == '/sync':
            try:
                result = subprocess.run(
                    [sys.executable, str(MIGRATE_SCRIPT), '--sync'],
                    capture_output=True, text=True, timeout=60
                )
                output = result.stdout + result.stderr
                lines = output.strip().split('\n')
                self._json_response(200, {
                    'success': result.returncode == 0,
                    'output': lines,
                    'summary': lines[-1] if lines else 'Unknown'
                })
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        elif self.path == '/duplicates':
            col_name = body.get('collection', COLLECTION_NAME)
            threshold = body.get('threshold', 0.1)  # cosine distance threshold
            sample_size = body.get('sample_size', 200)
            try:
                col = client.get_collection(col_name)
                total = col.count()
                # Get a sample of documents
                sample = col.get(limit=sample_size, include=['documents', 'metadatas', 'embeddings'])
                duplicates = []
                ids = sample['ids']
                docs = sample['documents']
                metas = sample['metadatas']
                embeds = sample['embeddings']
                seen = set()
                for i in range(len(ids)):
                    if ids[i] in seen:
                        continue
                    # Query for similar docs using this doc's embedding
                    results = col.query(
                        query_embeddings=[embeds[i]],
                        n_results=5,
                        include=['documents', 'metadatas', 'distances']
                    )
                    group = []
                    for j in range(len(results['ids'][0])):
                        rid = results['ids'][0][j]
                        dist = results['distances'][0][j]
                        if rid != ids[i] and dist <= threshold and rid not in seen:
                            group.append({
                                'id': rid,
                                'document': results['documents'][0][j],
                                'metadata': results['metadatas'][0][j],
                                'distance': dist
                            })
                    if group:
                        seen.add(ids[i])
                        for g in group:
                            seen.add(g['id'])
                        duplicates.append({
                            'anchor': {
                                'id': ids[i],
                                'document': docs[i],
                                'metadata': metas[i]
                            },
                            'similar': group
                        })
                self._json_response(200, {'duplicates': duplicates, 'scanned': len(ids), 'total': total})
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        elif self.path == '/delete':
            col_name = body.get('collection', COLLECTION_NAME)
            ids_to_delete = body.get('ids', [])
            if not ids_to_delete:
                self._json_response(400, {'error': 'ids is required'})
                return
            try:
                col = client.get_collection(col_name)
                col.delete(ids=ids_to_delete)
                self._json_response(200, {'success': True, 'deleted': len(ids_to_delete)})
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        elif self.path == '/sources':
            col_name = body.get('collection', COLLECTION_NAME)
            try:
                col = client.get_collection(col_name)
                total = col.count()
                # Get all metadatas
                data = col.get(limit=total, include=['metadatas'])
                source_counts: dict[str, int] = {}
                for m in data['metadatas']:
                    src = (m or {}).get('source', 'unknown')
                    source_counts[src] = source_counts.get(src, 0) + 1
                self._json_response(200, {'sources': source_counts, 'total': total})
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        elif self.path == '/timeline':
            col_name = body.get('collection', COLLECTION_NAME)
            offset = body.get('offset', 0)
            limit = body.get('limit', 100)
            try:
                col = client.get_collection(col_name)
                total = col.count()
                data = col.get(limit=total, include=['documents', 'metadatas'])
                # Sort by date descending
                items = []
                for i in range(len(data['ids'])):
                    meta = data['metadatas'][i] or {}
                    items.append({
                        'id': data['ids'][i],
                        'document': data['documents'][i],
                        'metadata': meta,
                        'date': meta.get('date', '1970-01-01')
                    })
                items.sort(key=lambda x: x['date'], reverse=True)
                page = items[offset:offset + limit]
                self._json_response(200, {'items': page, 'total': len(items)})
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        elif self.path == '/graph':
            col_name = body.get('collection', COLLECTION_NAME)
            sample_size = body.get('sample_size', 100)
            threshold = body.get('threshold', 0.15)
            try:
                col = client.get_collection(col_name)
                sample = col.get(limit=sample_size, include=['documents', 'metadatas', 'embeddings'])
                nodes = []
                links = []
                ids = sample['ids']
                docs = sample['documents']
                metas = sample['metadatas']
                embeds = sample['embeddings']
                for i in range(len(ids)):
                    meta = metas[i] or {}
                    nodes.append({
                        'id': ids[i],
                        'label': (docs[i] or '')[:60],
                        'source': meta.get('source', ''),
                        'date': meta.get('date', ''),
                    })
                # Compute pairwise cosine distances for edges
                import math
                def cosine_dist(a, b):
                    dot = sum(x*y for x, y in zip(a, b))
                    na = math.sqrt(sum(x*x for x in a))
                    nb = math.sqrt(sum(x*x for x in b))
                    if na == 0 or nb == 0:
                        return 1.0
                    return 1.0 - dot / (na * nb)

                for i in range(len(ids)):
                    for j in range(i+1, len(ids)):
                        d = cosine_dist(embeds[i], embeds[j])
                        if d <= threshold:
                            links.append({'source': ids[i], 'target': ids[j], 'distance': round(d, 4)})
                self._json_response(200, {'nodes': nodes, 'links': links})
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        elif self.path == '/collections':
            try:
                cols = client.list_collections()
                self._json_response(200, [
                    {'name': c.name, 'count': c.count()} for c in cols
                ])
            except Exception as e:
                self._json_response(500, {'error': str(e)})

        else:
            self._json_response(404, {'error': 'not found'})

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _json_response(self, code, data):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self._cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        pass


server = HTTPServer(('127.0.0.1', 3201), Handler)
print(f"Query proxy on http://localhost:3201", flush=True)
server.serve_forever()
