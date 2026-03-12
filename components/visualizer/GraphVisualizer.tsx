
import React, { useState, useRef, useEffect } from 'react';
import { motion as motionBase, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Share2, 
  Plus, 
  RotateCcw, 
  Play, 
  MousePointer2, 
  Info, 
  GitCommit,
  Network,
  Zap,
  Trash2,
  X,
  Move
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '../../utils/cn';

const motion = motionBase as any;

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  u: string;
  v: string;
}

type Algorithm = 'BFS' | 'DFS';

export const GraphVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '0', x: 200, y: 100, label: '0' },
    { id: '1', x: 400, y: 100, label: '1' },
    { id: '2', x: 200, y: 300, label: '2' },
    { id: '3', x: 400, y: 300, label: '3' },
    { id: '4', x: 600, y: 200, label: '4' },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { u: '0', v: '1' },
    { u: '0', v: '2' },
    { u: '1', v: '3' },
    { u: '2', v: '3' },
    { u: '3', v: '4' },
  ]);
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [structure, setStructure] = useState<string[]>([]); // Queue or Stack
  const [algorithm, setAlgorithm] = useState<Algorithm>('BFS');
  const [message, setMessage] = useState("Click canvas to add nodes. Drag nodes to move. Click to connect.");

  const svgRef = useRef<SVGSVGElement>(null);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isAnimating) return;
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Add a node
      const newNode: Node = {
        id: nodes.length.toString(),
        x,
        y,
        label: nodes.length.toString(),
      };
      setNodes([...nodes, newNode]);
    }
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (isAnimating) return;

    if (selectedNode === null) {
      setSelectedNode(nodeId);
      setMessage(`Node ${nodeId} selected. Click another node to create an edge.`);
    } else if (selectedNode === nodeId) {
      setSelectedNode(null);
      setMessage("Selection cleared.");
    } else {
      // Create edge if it doesn't exist
      const exists = edges.some(e => (e.u === selectedNode && e.v === nodeId) || (e.u === nodeId && e.v === selectedNode));
      if (!exists) {
        setEdges([...edges, { u: selectedNode, v: nodeId }]);
        setMessage(`Edge created between ${selectedNode} and ${nodeId}.`);
      }
      setSelectedNode(null);
    }
  };

  const handleDrag = (id: string, info: PanInfo) => {
    if (isAnimating) return;
    setNodes(prev => prev.map(n => 
      n.id === id 
        ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } 
        : n
    ));
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(null);
    setMessage("Selection cleared.");
  };

  const resetAnimation = () => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    setIsAnimating(false);
    setVisited([]);
    setCurrent(null);
    setStructure([]);
    setMessage("Visualization reset.");
  };

  const runBFS = async () => {
    if (nodes.length === 0) return;
    resetAnimation();
    setIsAnimating(true);
    setAlgorithm('BFS');

    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    });

    const q = ['0'];
    const visitedSet = new Set(['0']);
    setStructure(['0']);
    setVisited(['0']);
    setMessage("BFS: Starting traversal from Node 0.");

    const step = () => {
      if (q.length === 0) {
        setIsAnimating(false);
        setCurrent(null);
        setStructure([]);
        setMessage("BFS Complete: All reachable nodes visited.");
        return;
      }

      const u = q.shift()!;
      setStructure([...q]);
      setCurrent(u);
      
      const neighbors = adj[u].filter(v => !visitedSet.has(v));
      neighbors.forEach(v => {
        visitedSet.add(v);
        q.push(v);
      });

      setVisited(Array.from(visitedSet));
      setMessage(`BFS: Visiting node ${u}. Adding neighbors [${neighbors.join(', ')}] to queue.`);

      animationTimerRef.current = setTimeout(step, 1000);
    };

    animationTimerRef.current = setTimeout(step, 1000);
  };

  const runDFS = () => {
    if (nodes.length === 0) return;
    resetAnimation();
    setIsAnimating(true);
    setAlgorithm('DFS');

    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    });

    const stack = ['0'];
    const visitedSet = new Set<string>();
    setStructure(['0']);
    setMessage("DFS: Starting traversal from Node 0.");

    const step = () => {
      if (stack.length === 0) {
        setIsAnimating(false);
        setCurrent(null);
        setStructure([]);
        setMessage("DFS Complete: Traversal finished.");
        return;
      }

      const u = stack.pop()!;
      setStructure([...stack]);
      
      if (!visitedSet.has(u)) {
        visitedSet.add(u);
        setCurrent(u);
        setVisited(Array.from(visitedSet));

        const neighbors = adj[u].filter(v => !visitedSet.has(v));
        neighbors.forEach(v => stack.push(v));
        
        setStructure([...stack]);
        setMessage(`DFS: Visiting node ${u}. Pushing neighbors [${neighbors.join(', ')}] to stack.`);
      } else {
        setMessage(`DFS: Node ${u} already visited, skipping.`);
      }

      animationTimerRef.current = setTimeout(step, 1000);
    };

    animationTimerRef.current = setTimeout(step, 1000);
  };

  const clearGraph = () => {
    resetAnimation();
    setNodes([]);
    setEdges([]);
    setMessage("Graph cleared.");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      <GlassCard className="space-y-6" enableTilt={false}>
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Share2 className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Graph Traversal Visualizer</h3>
              <p className="text-slate-400 text-sm">Interactive Graph Algorithms</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={runBFS}
              disabled={isAnimating || nodes.length === 0}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/10 flex items-center gap-2"
            >
              <Zap size={16} /> BFS
            </button>
            <button 
              onClick={runDFS}
              disabled={isAnimating || nodes.length === 0}
              className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/10 flex items-center gap-2"
            >
              <GitCommit size={16} /> DFS
            </button>
            <button 
              onClick={resetAnimation}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl border border-white/5 transition-all"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={clearGraph}
              className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main SVG Canvas */}
          <div className="lg:col-span-3 h-[500px] bg-slate-950/40 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
               <MousePointer2 size={14} className="text-indigo-400" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{message}</span>
            </div>

            <svg 
              ref={svgRef}
              className="w-full h-full cursor-crosshair"
              onClick={handleCanvasClick}
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Edges */}
              {edges.map((edge, idx) => {
                const u = nodes.find(n => n.id === edge.u);
                const v = nodes.find(n => n.id === edge.v);
                if (!u || !v) return null;
                return (
                  <motion.line 
                    key={`${edge.u}-${edge.v}`}
                    layout
                    x1={u.x} y1={u.y} x2={v.x} y2={v.y} 
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                );
              })}

              {/* Nodes */}
              <AnimatePresence>
                {nodes.map((node) => {
                  const isVisited = visited.includes(node.id);
                  const isCurrent = current === node.id;
                  const isSelected = selectedNode === node.id;

                  return (
                    <motion.g
                      key={node.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, x: node.x, y: node.y }}
                      exit={{ scale: 0 }}
                      drag
                      dragMomentum={false}
                      onDrag={(e: any, info: PanInfo) => handleDrag(node.id, info)}
                      onClick={(e: React.MouseEvent) => handleNodeClick(e, node.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <motion.circle
                        cx={0}
                        cy={0}
                        r="20"
                        animate={{
                          fill: isCurrent ? 'rgb(99, 102, 241)' : isVisited ? 'rgba(16, 185, 129, 0.4)' : isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(15, 23, 42, 1)',
                          stroke: isCurrent || isSelected ? 'rgb(99, 102, 241)' : isVisited ? 'rgb(16, 185, 129)' : 'rgba(255, 255, 255, 0.1)',
                          strokeWidth: isCurrent || isSelected ? 3 : 2,
                        }}
                        style={{ filter: isCurrent || isSelected ? 'url(#glow)' : 'none' }}
                        transition={{ duration: 0.3 }}
                      />
                      <text
                        x={0}
                        y={5}
                        textAnchor="middle"
                        className="fill-white text-[10px] font-black pointer-events-none select-none"
                      >
                        {node.label}
                      </text>

                      {/* Selection Clear Button (x) */}
                      {isSelected && (
                        <motion.g
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.2 }}
                          onClick={handleClearSelection}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={18}
                            cy={-18}
                            r="8"
                            className="fill-rose-500 shadow-lg"
                          />
                          <path
                            d={`M 15 -15 L 21 -21 M 21 -15 L 15 -21`}
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </motion.g>
                      )}

                      {/* Drag Handle Indicator (Optional visual cue) */}
                      <motion.g 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ pointerEvents: 'none' }}
                      >
                        <Move size={8} x={12} y={12} className="text-slate-600" />
                      </motion.g>
                    </motion.g>
                  );
                })}
              </AnimatePresence>
            </svg>
          </div>

          {/* Sidebar Trace / Legend */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Network size={16} className="text-indigo-400" />
                <h4 className="text-xs font-black uppercase tracking-tight">{algorithm} {isAnimating ? 'In Progress' : 'Data'}</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">{algorithm === 'BFS' ? 'Queue' : 'Stack'}</p>
                  <div className="flex flex-wrap gap-2">
                    {structure.length === 0 ? (
                      <span className="text-[10px] text-slate-600 italic">Empty</span>
                    ) : (
                      structure.map((id, i) => (
                        <div key={i} className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                          {id}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Visited Order</p>
                  <div className="flex flex-wrap gap-2">
                    {visited.map((id, i) => (
                      <div key={i} className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                        {id}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Info size={16} className="text-purple-400" />
                <h4 className="text-xs font-black uppercase tracking-tight">Algorithm Info</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                {algorithm === 'BFS' 
                  ? "BFS explores neighbors level by level using a Queue (FIFO). Good for finding the shortest path in unweighted graphs."
                  : "DFS explores as far as possible along each branch before backtracking using a Stack (LIFO) or Recursion."
                }
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest pt-2 mt-auto border-t border-white/5">
                <span className="text-slate-500">Complexity</span>
                <span className="text-indigo-400">O(V + E)</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
