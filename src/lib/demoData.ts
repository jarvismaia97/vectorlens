// Demo data for VectorLens when no ChromaDB backend is available

export interface DemoDocument {
  id: string;
  document: string;
  metadata: Record<string, unknown>;
}

export interface DemoCollection {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
  documents: DemoDocument[];
}

const agentMemories: DemoDocument[] = [
  { id: 'mem-001', document: 'User prefers dark mode across all applications. Confirmed multiple times.', metadata: { source: 'dm:preferences', timestamp: '2025-01-15T10:23:00Z', tags: 'preference,ui', importance: 0.8 } },
  { id: 'mem-002', document: 'Had a detailed conversation about setting up a home Kubernetes cluster. User runs k3s on 3 Raspberry Pi 5 nodes.', metadata: { source: 'session:homelab', timestamp: '2025-01-14T16:45:00Z', tags: 'homelab,kubernetes,raspberrypi', importance: 0.9 } },
  { id: 'mem-003', document: 'User asked me to always respond in Portuguese when the conversation starts in Portuguese.', metadata: { source: 'dm:language', timestamp: '2025-01-13T09:12:00Z', tags: 'preference,language', importance: 0.95 } },
  { id: 'mem-004', document: 'Decided to use ChromaDB as the primary vector store for long-term memory. Deployed via Docker on the homelab.', metadata: { source: 'session:architecture', timestamp: '2025-01-12T14:30:00Z', tags: 'architecture,chromadb,decision', importance: 0.85 } },
  { id: 'mem-005', document: 'User works as a software engineer, primarily with TypeScript, Python, and Go. Strong preference for clean, minimal code.', metadata: { source: 'dm:profile', timestamp: '2025-01-11T08:00:00Z', tags: 'profile,skills', importance: 0.9 } },
  { id: 'mem-006', document: 'Morning routine: user checks messages between 8-9am Lisbon time. Best time for non-urgent updates.', metadata: { source: 'session:scheduling', timestamp: '2025-01-10T08:15:00Z', tags: 'routine,scheduling', importance: 0.6 } },
  { id: 'mem-007', document: 'Migrated all memory chunks from markdown files to ChromaDB. 67 chunks indexed successfully using nomic-embed-text embeddings.', metadata: { source: 'session:migration', timestamp: '2025-01-09T20:00:00Z', tags: 'migration,chromadb,task', importance: 0.7 } },
  { id: 'mem-008', document: 'User has a cat named Pixel who sometimes walks across the keyboard during coding sessions.', metadata: { source: 'dm:personal', timestamp: '2025-01-08T22:10:00Z', tags: 'personal,fun', importance: 0.3 } },
  { id: 'mem-009', document: 'Task completed: Set up Tailscale mesh VPN across all homelab nodes. All devices can now reach each other via tailnet hostnames.', metadata: { source: 'session:homelab', timestamp: '2025-01-07T17:30:00Z', tags: 'homelab,networking,tailscale,task', importance: 0.75 } },
  { id: 'mem-010', document: 'User prefers Bun over Node.js for TypeScript execution. Use pnpm for package management.', metadata: { source: 'dm:preferences', timestamp: '2025-01-06T11:20:00Z', tags: 'preference,tooling', importance: 0.8 } },
  { id: 'mem-011', document: 'Discussed the pros and cons of RAG vs fine-tuning for personal AI assistants. Concluded RAG with good chunking is more practical.', metadata: { source: 'session:ai-discussion', timestamp: '2025-01-05T15:45:00Z', tags: 'ai,rag,architecture,discussion', importance: 0.85 } },
  { id: 'mem-012', document: 'WhatsApp group "Candelabros" requires responding to ALL messages (requireMention: false). Other groups need @mention.', metadata: { source: 'session:config', timestamp: '2025-01-04T10:00:00Z', tags: 'config,whatsapp,groups', importance: 0.9 } },
  { id: 'mem-013', document: 'User birthday is March 22. Likes minimalist gifts, good coffee, and tech gadgets.', metadata: { source: 'dm:personal', timestamp: '2025-01-03T19:30:00Z', tags: 'personal,birthday', importance: 0.5 } },
  { id: 'mem-014', document: 'Resolved embedding dimension mismatch: ChromaDB collection expected 384 dims but Ollama nomic-embed-text generates 768. Recreated collection with correct dimensions.', metadata: { source: 'session:bugfix', timestamp: '2025-01-02T21:15:00Z', tags: 'bugfix,embeddings,chromadb', importance: 0.7 } },
  { id: 'mem-015', document: 'User runs Ollama locally for embeddings and small model inference. GPU: Apple M2 Pro with 32GB unified memory.', metadata: { source: 'session:hardware', timestamp: '2025-01-01T12:00:00Z', tags: 'hardware,ollama,profile', importance: 0.75 } },
  { id: 'mem-016', document: 'Preference: when writing commit messages, use conventional commit format with short, action-oriented descriptions.', metadata: { source: 'dm:preferences', timestamp: '2024-12-30T14:20:00Z', tags: 'preference,git,workflow', importance: 0.7 } },
  { id: 'mem-017', document: 'Deployed VectorLens (ChromaDB viewer) to Vercel. Needs demo mode for when no backend is connected.', metadata: { source: 'session:deployment', timestamp: '2024-12-29T16:00:00Z', tags: 'vectorlens,deployment,vercel,task', importance: 0.65 } },
  { id: 'mem-018', document: 'User timezone is Europe/Lisbon (WET/WEST). Always use this for scheduling and time references.', metadata: { source: 'dm:preferences', timestamp: '2024-12-28T09:00:00Z', tags: 'preference,timezone', importance: 0.9 } },
  { id: 'mem-019', document: 'Group conversation about weekend hiking plans near Sintra. User enjoys outdoor activities on weekends.', metadata: { source: 'group:cavalheiros', timestamp: '2024-12-27T20:45:00Z', tags: 'personal,hobbies,social', importance: 0.3 } },
  { id: 'mem-020', document: 'Implemented a proxy server for ChromaDB that adds semantic search, timeline, duplicates detection, and graph visualization endpoints.', metadata: { source: 'session:development', timestamp: '2024-12-26T18:30:00Z', tags: 'development,chromadb,proxy,task', importance: 0.8 } },
];

const knowledgeBase: DemoDocument[] = [
  { id: 'kb-001', document: 'ChromaDB is an open-source embedding database designed for AI applications. It supports persistent storage, metadata filtering, and multiple embedding functions. Default API runs on port 8000.', metadata: { source: 'docs:chromadb', timestamp: '2025-01-10T00:00:00Z', tags: 'chromadb,database,reference', category: 'infrastructure' } },
  { id: 'kb-002', document: 'Retrieval-Augmented Generation (RAG) combines a retrieval system with a generative model. Documents are chunked, embedded, and stored in a vector database. At query time, relevant chunks are retrieved and fed as context to the LLM.', metadata: { source: 'docs:rag', timestamp: '2025-01-09T00:00:00Z', tags: 'rag,ai,architecture', category: 'concepts' } },
  { id: 'kb-003', document: 'Tailscale is a zero-config mesh VPN built on WireGuard. It creates a secure network (tailnet) between devices. Key features: MagicDNS, ACL policies, subnet routing, and exit nodes.', metadata: { source: 'docs:tailscale', timestamp: '2025-01-08T00:00:00Z', tags: 'tailscale,networking,vpn', category: 'infrastructure' } },
  { id: 'kb-004', document: 'k3s is a lightweight Kubernetes distribution by Rancher. It bundles all components into a single binary under 100MB. Ideal for edge, IoT, and homelab deployments. Supports ARM64 natively.', metadata: { source: 'docs:kubernetes', timestamp: '2025-01-07T00:00:00Z', tags: 'kubernetes,k3s,homelab', category: 'infrastructure' } },
  { id: 'kb-005', document: 'Ollama runs large language models locally. Supports model pulling, serving via REST API on port 11434, and embedding generation. Popular models: llama3, mistral, nomic-embed-text.', metadata: { source: 'docs:ollama', timestamp: '2025-01-06T00:00:00Z', tags: 'ollama,llm,local-ai', category: 'tools' } },
  { id: 'kb-006', document: 'Cosine similarity measures the angle between two vectors. Values range from -1 to 1, where 1 means identical direction. In ChromaDB, distances are often returned as 1 - cosine_similarity, so lower values mean more similar.', metadata: { source: 'docs:embeddings', timestamp: '2025-01-05T00:00:00Z', tags: 'embeddings,math,similarity', category: 'concepts' } },
  { id: 'kb-007', document: 'Vite is a next-generation frontend build tool. It uses native ES modules for development and Rollup for production builds. Key features: instant HMR, TypeScript support out of the box, and plugin ecosystem.', metadata: { source: 'docs:vite', timestamp: '2025-01-04T00:00:00Z', tags: 'vite,frontend,tooling', category: 'tools' } },
  { id: 'kb-008', document: 'Docker Compose defines multi-container applications in a YAML file. Use `docker compose up -d` to start services. Volumes persist data, networks isolate communication. Health checks ensure readiness.', metadata: { source: 'docs:docker', timestamp: '2025-01-03T00:00:00Z', tags: 'docker,containers,deployment', category: 'infrastructure' } },
  { id: 'kb-009', document: 'WebSockets provide full-duplex communication over a single TCP connection. The protocol starts with an HTTP upgrade handshake. Useful for real-time applications like chat, notifications, and live data feeds.', metadata: { source: 'docs:websockets', timestamp: '2025-01-02T00:00:00Z', tags: 'websockets,networking,realtime', category: 'concepts' } },
  { id: 'kb-010', document: 'Vercel deploys frontend applications with zero configuration. It supports automatic previews for PRs, edge functions, and serverless API routes. Framework detection auto-configures build settings for Vite, Next.js, etc.', metadata: { source: 'docs:vercel', timestamp: '2025-01-01T00:00:00Z', tags: 'vercel,deployment,hosting', category: 'tools' } },
];

export const DEMO_COLLECTIONS: DemoCollection[] = [
  {
    id: 'demo-col-001',
    name: 'ai-agent-memories',
    metadata: { description: 'Personal AI agent long-term memory store' },
    documents: agentMemories,
  },
  {
    id: 'demo-col-002',
    name: 'knowledge-base',
    metadata: { description: 'Technical knowledge base and documentation' },
    documents: knowledgeBase,
  },
];
