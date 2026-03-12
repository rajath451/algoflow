
import React, { useState, useRef, useEffect } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  Layers, 
  Database, 
  Zap, 
  Settings2,
  RefreshCw,
  Info
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '../../utils/cn';

const motion = motionBase as any;

type ListType = 'Singly' | 'Doubly' | 'Circular' | 'Doubly Circular';

interface LLNode {
  id: string;
  value: number;
}

export const LinkedListVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<LLNode[]>([
    { id: '1', value: 10 },
    { id: '2', value: 20 },
    { id: '3', value: 30 }
  ]);
  const [listType, setListType] = useState<ListType>('Singly');
  const [inputValue, setInputValue] = useState("");
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);

  const addNode = (atStart: boolean = false) => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const newNode = { id: Math.random().toString(36).substr(2, 9), value: val };
    
    if (atStart) {
      setHighlightIdx(0);
      setNodes([newNode, ...nodes]);
    } else {
      setHighlightIdx(nodes.length);
      setNodes([...nodes, newNode]);
    }
    setInputValue("");
    setTimeout(() => setHighlightIdx(null), 800);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const clearList = () => {
    setNodes([]);
    setHighlightIdx(null);
  };

  const isDoubly = listType === 'Doubly' || listType === 'Doubly Circular';
  const isCircular = listType === 'Circular' || listType === 'Doubly Circular';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Configuration Header */}
      <GlassCard enableTilt={false} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Layers className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">{listType} Linked List</h3>
              <p className="text-slate-400 text-sm">Dynamic Memory Pointers</p>
            </div>
          </div>

          <div className="flex bg-slate-900 rounded-xl p-1 border border-white/5">
            {(['Singly', 'Doubly', 'Circular', 'Doubly Circular'] as ListType[]).map((type) => (
              <button
                key={type}
                onClick={() => setListType(type)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  listType === type 
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Node Data</label>
            <div className="flex gap-2">
              <input 
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNode()}
                placeholder="Value"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
              />
              <button 
                onClick={() => addNode(true)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-indigo-400 rounded-xl border border-white/5 font-bold transition-all text-sm uppercase tracking-tighter"
              >
                Prepend
              </button>
              <button 
                onClick={() => addNode(false)}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 text-sm uppercase tracking-tighter"
              >
                Append
              </button>
            </div>
          </div>

          <button 
            onClick={clearList}
            className="px-4 py-3 text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-2 text-xs font-bold uppercase"
          >
            <RefreshCw size={14} /> Clear List
          </button>
        </div>
      </GlassCard>

      {/* Main Visualization Canvas */}
      <GlassCard className="min-h-[450px] flex items-center justify-center p-0 overflow-hidden relative" enableTilt={false}>
        <div className="absolute top-6 left-6 flex gap-6">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Head Pointer</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tail Pointer</span>
           </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center px-12 py-24 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-6 relative">
            <AnimatePresence mode="popLayout">
              {nodes.map((node, idx) => {
                const isHighlight = highlightIdx === idx;
                const isHead = idx === 0;
                const isTail = idx === nodes.length - 1;

                return (
                  <React.Fragment key={node.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.5, y: 50 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        transition: { type: 'spring', damping: 20 }
                      }}
                      exit={{ opacity: 0, scale: 0, x: -50 }}
                      className="relative group"
                    >
                      {/* Node Labels (Head/Tail) */}
                      {isHead && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                          Head
                        </div>
                      )}
                      {isTail && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                          Tail
                        </div>
                      )}

                      <div className={cn(
                        "w-24 h-24 rounded-3xl bg-slate-900 border-2 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500",
                        isHighlight ? "border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)]" : "border-white/5 group-hover:border-white/20",
                        isHead && "border-indigo-500/30",
                        isTail && "border-emerald-500/30"
                      )}>
                        <div className="text-[10px] font-black text-slate-600 mb-1 uppercase tracking-widest">Data</div>
                        <div className="text-2xl font-black text-white">{node.value}</div>
                        
                        {/* Address Placeholder */}
                        <div className="mt-2 flex gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                           <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                           <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        </div>

                        <button 
                          onClick={() => removeNode(node.id)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-90"
                        >
                          <Trash2 size={12} className="text-white" />
                        </button>
                      </div>

                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-700">
                        ADDR: 0x{node.id.slice(0, 4)}
                      </div>
                    </motion.div>

                    {/* Arrows */}
                    {idx < nodes.length - 1 && (
                      <div className="flex flex-col gap-1 items-center px-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: 40 }} className="flex flex-col">
                          <div className="flex items-center text-indigo-500/50">
                             <ArrowRight size={24} className="drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]" />
                          </div>
                          {isDoubly && (
                            <div className="flex items-center text-purple-500/50 -mt-1">
                               <ArrowLeft size={24} className="drop-shadow-[0_0_5px_rgba(168,85,247,0.3)]" />
                            </div>
                          )}
                        </motion.div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </AnimatePresence>

            {/* NULL or Circular Pointer */}
            {nodes.length > 0 && !isCircular && (
              <div className="flex items-center gap-3 ml-4">
                 <ArrowRight size={20} className="text-slate-800" />
                 <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] font-black text-rose-400 tracking-widest uppercase">
                    NULL
                 </div>
              </div>
            )}

            {/* Circular Return Path */}
            {nodes.length > 1 && isCircular && (
              <svg className="absolute inset-0 pointer-events-none overflow-visible" width="100%" height="100%">
                <defs>
                   <marker id="arrowhead-fwd" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="rgba(99, 102, 241, 0.4)" />
                   </marker>
                   <marker id="arrowhead-rev" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                      <polygon points="10 0, 0 3.5, 10 7" fill="rgba(168, 85, 247, 0.4)" />
                   </marker>
                </defs>
                {/* Forward Circular Arrow */}
                <path 
                  d={`M ${(nodes.length - 1) * 164 + 96} 48 Q ${(nodes.length - 1) * 82 + 48} -60 48 48`}
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.2)"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead-fwd)"
                  className="animate-[dash_20s_linear_infinite]"
                />
                {/* Reverse Circular Arrow for Doubly Circular */}
                {listType === 'Doubly Circular' && (
                  <path 
                    d={`M 48 144 Q ${(nodes.length - 1) * 82 + 48} 250 ${(nodes.length - 1) * 164 + 96} 144`}
                    fill="none"
                    stroke="rgba(168, 85, 247, 0.2)"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead-rev)"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                )}
              </svg>
            )}

            {nodes.length === 0 && (
              <div className="flex flex-col items-center gap-4 text-slate-700">
                <Database size={48} strokeWidth={1} />
                <p className="font-mono text-sm italic">Memory Heap Empty</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col gap-4">
           <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Zap className="text-amber-400 w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-tight">Pointer Logic</h4>
           </div>
           <p className="text-slate-400 text-xs leading-relaxed">
             {listType === 'Singly' && "Every node has a 'Next' pointer which stores the memory address of the following element."}
             {listType === 'Doubly' && "Nodes store both 'Next' and 'Prev' pointers, allowing bidirectional traversal throughout the list."}
             {listType === 'Circular' && "The 'Next' pointer of the tail node links back to the Head node, forming a closed loop."}
             {listType === 'Doubly Circular' && "A hybrid where Next and Prev pointers exist, and both ends wrap around to create a symmetric ring."}
           </p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
           <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Info className="text-indigo-400 w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-tight">Operation Costs</h4>
           </div>
           <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-slate-500">Insert Head</span>
                 <span className="text-emerald-400">O(1)</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-slate-500">Search Value</span>
                 <span className="text-amber-400">O(n)</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-slate-500">Deletion</span>
                 <span className="text-indigo-400">O(1) / O(n)</span>
              </div>
           </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
           <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Settings2 className="text-purple-400 w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-tight">Memory Usage</h4>
           </div>
           <div className="text-[10px] font-mono text-slate-500">
              <p>Node Struct {listType.includes('Doubly') ? '(Doubly)' : '(Singly)'}:</p>
              <pre className="mt-2 text-indigo-300">
{`struct Node {
  int data;
  Node *next;
${listType.includes('Doubly') ? '  Node *prev;' : ''}
}`}
              </pre>
           </div>
        </GlassCard>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
};
