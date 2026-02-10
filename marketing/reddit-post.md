# Reddit Post — r/LocalLLaMA and r/langchain

## Title
**VectorLens — a free, open-source UI for browsing and searching your ChromaDB collections**

## Body

Hey folks 👋

I built **VectorLens** because I got tired of writing Python scripts every time I wanted to check what's actually inside my ChromaDB collections.

**The problem:** ChromaDB is amazing for embeddings, but inspecting your data means writing throwaway scripts or staring at raw JSON. There's no quick way to browse documents, run semantic searches, or spot duplicates.

**The solution:** VectorLens is a lightweight React dashboard that connects to any ChromaDB instance and gives you:

- 📂 **Browse** — See all collections, documents, metadata and embeddings at a glance
- 🔎 **Semantic Search** — Natural language queries with similarity scores
- 📅 **Timeline** — Visualize when documents were added, filter by date
- 🕸️ **Memory Graph** — Force-directed graph showing document relationships
- 🔁 **Duplicate Detection** — Find near-duplicate entries across collections
- 💾 **Store Memory** — Add new documents directly from the UI
- 🌓 **Dark/Light mode** — Because we're not animals

**Stack:** React 19 + TypeScript + Tailwind CSS 4 + Vite 7. Backend is a thin FastAPI proxy. Docker Compose for one-command setup.

```bash
git clone https://github.com/jarvismaia97/vectorlens.git
cd vectorlens && docker compose up -d
# Open http://localhost:8080
```

**GitHub:** https://github.com/jarvismaia97/vectorlens

Would love feedback — especially on what views/features would be most useful for your workflow. PRs welcome! 🙏
