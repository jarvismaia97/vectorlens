# ChromaDB Viewer

## Project Overview
A local-first, modern web UI for exploring and querying ChromaDB vector databases. Built for developers and AI engineers who need to inspect, browse, and semantically search their vector collections.

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4 (dark theme, data-observatory aesthetic)
- **Icons**: Lucide React (consistent, clean line icons)
- **API**: ChromaDB v2 REST API (proxied via Vite dev server)

## Architecture
```
src/
├── lib/
│   └── chromaClient.ts    # ChromaDB v2 API client (fetch-based, no SDK)
├── components/
│   ├── Sidebar.tsx         # Navigation: collections, views, connection status
│   ├── StatsBar.tsx        # Collection metrics: ID, count, embedding space
│   ├── DocumentCard.tsx    # Chunk display: content, metadata tags, score bar, copy
│   ├── BrowseView.tsx      # Paginated document browser
│   └── SearchView.tsx      # Semantic search with natural language queries
├── App.tsx                 # Layout shell, state management
├── main.tsx                # Entry point
└── index.css               # Tailwind imports, CSS variables, animations
```

## Design System & UI/UX Guidelines

### Visual Language
- **Theme**: Dark observatory — deep navy/charcoal backgrounds, indigo/purple accents
- **Cards**: Subtle glow on hover (`glow-card` class), rounded-xl corners
- **Typography**: Inter font, size hierarchy (10px labels, 12px body, 14px headings)
- **Colors**: CSS custom properties in `:root` for consistency
- **Animations**: Fade-in on content load, score bar grow animation

### Data Visualization Patterns
- **Score bars**: Gradient indigo→purple, animated width, percentage label
- **Metadata tags**: Color-coded pills (indigo for source, purple for section, neutral for other)
- **Pagination**: Simple prev/next with page counter (not infinite scroll — intentional for data inspection)
- **Empty states**: Centered icon + message, never a blank screen

### UX Principles for Vector DB Inspection
1. **Glanceable metadata**: Source/section visible without expanding
2. **Content preview by default**: Show first 200 chars, expand on demand
3. **Copy-first workflow**: One-click copy on every chunk
4. **Score transparency**: Always show distance/relevance when available
5. **Non-destructive**: Read-only UI — no mutations via the interface
6. **Keyboard-friendly**: Enter to search, no unnecessary clicks

### Accessibility
- Sufficient contrast ratios on dark backgrounds
- Focus-visible states on interactive elements
- Semantic HTML structure
- Screen-reader friendly labels

## Commands
```bash
npm run dev     # Start dev server on :3200
npm run build   # Production build
npm run preview # Preview production build
```

## Configuration
- ChromaDB host is proxied in `vite.config.ts` → `http://localhost:8000`
- To change the ChromaDB endpoint, edit the proxy target in `vite.config.ts`
- Default tenant: `default_tenant`, default database: `default_database`

## Key Design Decisions
- **No ChromaDB SDK**: Direct fetch to v2 REST API to avoid version mismatches and keep bundle small
- **Vite proxy**: Avoids CORS issues; API calls go to `/api/v2/*` and get proxied to ChromaDB
- **CSS variables over Tailwind config**: Easier to theme and override
- **Lucide over emoji**: Consistent visual weight, scalable, accessible
- **Read-only**: This is an observation tool, not an admin panel. No create/update/delete operations.

## Extending
- Add new views by creating a component in `src/components/` and adding a nav entry in `Sidebar.tsx`
- Metadata filters: extend `SearchView` with `where` clause support in `queryCollection()`
- Embedding visualization: add a t-SNE/UMAP view component using `include: ['embeddings']`
- Export: add CSV/JSON export buttons to `BrowseView` and `SearchView`
