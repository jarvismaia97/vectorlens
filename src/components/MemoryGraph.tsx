import { GitBranch, Loader } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import type { CollectionInfo } from '../lib/chromaClient';

// Lazy-load react-force-graph-2d to avoid SSR issues
import ForceGraph2D from 'react-force-graph-2d';

interface GraphNode {
  id: string;
  label: string;
  source: string;
  date: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  distance: number;
}

interface MemoryGraphProps {
  collection: CollectionInfo | null;
}

const SOURCE_COLORS: Record<string, string> = {
  'session': '#818cf8',
  'dm': '#34d399',
  'group': '#fbbf24',
  'system': '#f87171',
};

function getColor(source: string): string {
  for (const [prefix, color] of Object.entries(SOURCE_COLORS)) {
    if (source.startsWith(prefix)) return color;
  }
  return '#8888aa';
}

export function MemoryGraph({ collection }: MemoryGraphProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sampleSize, setSampleSize] = useState(80);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadGraph = async () => {
    if (!collection) return;
    setLoading(true);
    try {
      const res = await fetch('/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: collection.name, sample_size: sampleSize, threshold: 0.15 }),
      });
      const data = await res.json();
      setNodes(data.nodes || []);
      setLinks(data.links || []);
      setLoaded(true);
    } catch {
      setNodes([]);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D) => {
    const color = getColor(node.source);
    const isHovered = hovered?.id === node.id;
    const radius = isHovered ? 7 : 4;

    // Glow effect on hover
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, 12, 0, 2 * Math.PI);
      ctx.fillStyle = color + '22';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = isHovered ? '#fff' : color + '66';
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.stroke();

    // Show small label for hovered node
    if (isHovered) {
      ctx.font = '10px system-ui';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(node.source, node.x!, node.y! - 12);
    }
  }, [hovered]);

  if (!collection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <GitBranch size={40} className="text-[var(--accent)]/30 mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Select a collection to visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] justify-center">
        <label className="text-[10px] text-[var(--text-secondary)]">Sample:</label>
        <select
          value={sampleSize}
          onChange={(e) => setSampleSize(Number(e.target.value))}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-2 py-1 text-[10px] text-[var(--text-primary)] outline-none"
        >
          {[50, 80, 100, 150, 200].map((n) => (
            <option key={n} value={n}>{n} nodes</option>
          ))}
        </select>
        <button
          onClick={loadGraph}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader size={12} className="animate-spin" /> : <GitBranch size={12} />}
          {loading ? 'Loading…' : loaded ? 'Reload Graph' : 'Generate Graph'}
        </button>

        {loaded && (
          <div className="flex items-center gap-3 ml-4">
            {Object.entries(SOURCE_COLORS).map(([prefix, color]) => (
              <span key={prefix} className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {prefix}:
              </span>
            ))}
          </div>
        )}
      </div>

      {loaded && (
        <div
          className="flex-1 relative"
          ref={containerRef}
          onMouseMove={(e) => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
          }}
        >
          <ForceGraph2D
            ref={graphRef}
            graphData={{ nodes, links }}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, 8, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            linkColor={() => 'rgba(99, 102, 241, 0.15)'}
            linkWidth={0.5}
            onNodeHover={(node: GraphNode | null) => setHovered(node)}
            backgroundColor="transparent"
            width={typeof window !== 'undefined' ? window.innerWidth - 256 : 800}
            height={typeof window !== 'undefined' ? window.innerHeight - 120 : 600}
          />
          {hovered && (
            <div
              className="absolute pointer-events-none z-50"
              style={{
                left: Math.min(mousePos.x + 16, (containerRef.current?.clientWidth || 800) - 380),
                top: Math.max(mousePos.y - 10, 8),
              }}
            >
              <div className="bg-[var(--bg-primary)]/95 backdrop-blur-md border border-[var(--border)] rounded-xl p-4 max-w-[360px] shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getColor(hovered.source) }}
                  />
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    {hovered.source}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] ml-auto">
                    {hovered.date}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap break-words">
                  {hovered.label.length > 300 ? hovered.label.slice(0, 300) + '…' : hovered.label}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!loaded && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <GitBranch size={48} className="text-[var(--accent)]/20 mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">Click "Generate Graph" to visualize memory relationships</p>
          </div>
        </div>
      )}
    </div>
  );
}
