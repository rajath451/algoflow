
import React, { useState, useRef, useEffect } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { 
  Hash, 
  Plus, 
  RotateCcw, 
  AlertCircle, 
  Search, 
  Zap,
  ArrowDown,
  Info,
  Database
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '../../utils/cn';

const motion = motionBase as any;

const TABLE_SIZE = 13; // Using a prime number for better hash distribution

interface HashBucket {
  index: number;
  value: number | null;
  status: 'empty' | 'occupied' | 'probing' | 'collision' | 'success';
}

interface HashingState {
  table: HashBucket[];
  currentKey: number | null;
  currentIndex: number | null;
  probingCount: number;
  message: string;
  isAnimating: boolean;
}

export const HashingVisualizer: React.FC = () => {
  const [state, setState] = useState<HashingState>({
    table: Array.from({ length: TABLE_SIZE }, (_, i) => ({
      index: i,
      value: null,
      status: 'empty',
    })),
    currentKey: null,
    currentIndex: null,
    probingCount: 0,
    message: "Ready to hash. Enter a number to see linear probing in action.",
    isAnimating: false,
  });

  const [inputValue, setInputValue] = useState("");
  // Fix: Replace NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve "Cannot find namespace 'NodeJS'" error
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTable = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({
      table: Array.from({ length: TABLE_SIZE }, (_, i) => ({
        index: i,
        value: null,
        status: 'empty',
      })),
      currentKey: null,
      currentIndex: null,
      probingCount: 0,
      message: "Hash table cleared.",
      isAnimating: false,
    });
  };

  const startInsertion = async () => {
    const key = parseInt(inputValue);
    if (isNaN(key)) return;
    if (state.isAnimating) return;

    // Check if table is full
    if (state.table.every(b => b.value !== null)) {
      setState(prev => ({ ...prev, message: "Error: Hash Table is full!" }));
      return;
    }

    setInputValue("");
    let initialIndex = key % TABLE_SIZE;
    
    setState(prev => ({
      ...prev,
      currentKey: key,
      currentIndex: initialIndex,
      probingCount: 0,
      isAnimating: true,
      message: `Calculating hash: ${key} % ${TABLE_SIZE} = ${initialIndex}`,
      table: prev.table.map(b => ({ ...b, status: b.value === null ? 'empty' : 'occupied' }))
    }));

    await performProbing(key, initialIndex);
  };

  const performProbing = async (key: number, startIndex: number) => {
    let currIdx = startIndex;
    let probes = 0;

    const probeStep = () => {
      setState(prev => {
        const newTable = [...prev.table];
        const bucket = newTable[currIdx];

        // If bucket is empty, we found our spot
        if (bucket.value === null) {
          newTable[currIdx] = { ...bucket, value: key, status: 'success' };
          return {
            ...prev,
            table: newTable,
            isAnimating: false,
            message: probes === 0 
              ? `Success! Inserted ${key} at index ${currIdx}.` 
              : `Success! Resolved collision after ${probes} probe(s). Inserted at ${currIdx}.`
          };
        } 

        // Collision detected
        newTable[currIdx] = { ...bucket, status: 'collision' };
        let nextIdx = (currIdx + 1) % TABLE_SIZE;
        probes++;
        
        timerRef.current = setTimeout(() => {
          setState(s => ({
            ...s,
            currentIndex: nextIdx,
            probingCount: probes,
            message: `Collision at index ${currIdx}! Probing next index: (${currIdx} + 1) % ${TABLE_SIZE} = ${nextIdx}`,
            table: s.table.map((b, i) => i === currIdx ? { ...b, status: 'occupied' } : b)
          }));
          currIdx = nextIdx;
          probeStep();
        }, 800);

        return {
          ...prev,
          table: newTable,
          message: `Collision at index ${currIdx}! Looking for next available slot...`
        };
      });
    };

    // Small delay before first probe
    timerRef.current = setTimeout(probeStep, 1000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Configuration */}
      <GlassCard enableTilt={false} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Hash className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Linear Probing Visualizer</h3>
              <p className="text-slate-400 text-sm">Collision Resolution Strategy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 rounded-xl p-1 border border-white/5">
              <span className="px-4 py-2 text-xs font-black uppercase text-slate-500 tracking-widest border-r border-white/5">
                Function
              </span>
              <span className="px-4 py-2 text-xs font-mono font-bold text-indigo-400">
                h(k) = k % {TABLE_SIZE}
              </span>
            </div>
            <button 
              onClick={resetTable}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all border border-white/5"
              title="Reset Table"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Insert Key</label>
            <div className="flex gap-2">
              <input 
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startInsertion()}
                placeholder="Enter value (e.g. 42)"
                disabled={state.isAnimating}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm disabled:opacity-50"
              />
              <button 
                onClick={startInsertion}
                disabled={state.isAnimating || !inputValue}
                className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/10 flex items-center gap-2"
              >
                <Plus size={18} /> Insert
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl border border-white/5 p-4 flex-1 flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center border",
              state.isAnimating ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400" : "bg-white/5 border-white/5 text-slate-600"
            )}>
              {state.isAnimating ? <Zap className="animate-pulse" size={20} /> : <Search size={20} />}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Current Action</p>
               <p className="text-sm font-medium text-white truncate">{state.message}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <GlassCard className="h-full flex flex-col gap-6" enableTilt={false}>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-2">
                  <Database size={16} className="text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Hash Table Array</span>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Success</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> Collision</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Probing</div>
               </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 py-4">
              <AnimatePresence mode="popLayout">
                {state.table.map((bucket, idx) => {
                  const isCurrent = state.currentIndex === idx;
                  
                  return (
                    <motion.div
                      key={idx}
                      layout
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300",
                        bucket.status === 'success' ? "bg-emerald-500/10 border-emerald-500/30" :
                        bucket.status === 'collision' ? "bg-rose-500/10 border-rose-500/30" :
                        isCurrent ? "bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105 z-10" :
                        "bg-white/5 border-white/5"
                      )}
                    >
                      <span className="text-[9px] font-mono text-slate-600 font-bold uppercase">Index {idx}</span>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
                        <motion.span 
                          key={bucket.value}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "text-lg font-mono font-bold",
                            bucket.value === null ? "text-slate-800" : "text-white"
                          )}
                        >
                          {bucket.value === null ? "-" : bucket.value}
                        </motion.span>
                      </div>
                      
                      {isCurrent && (
                        <motion.div 
                          layoutId="pointer"
                          className="absolute -top-6 text-indigo-400"
                        >
                          <ArrowDown size={20} className="animate-bounce" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <GlassCard className="flex flex-col gap-4">
             <div className="flex items-center gap-2 mb-2">
                <Info size={18} className="text-indigo-400" />
                <h4 className="font-bold text-sm uppercase">Linear Probing</h4>
             </div>
             <p className="text-slate-400 text-xs leading-relaxed">
               When a collision occurs at index <code className="text-indigo-300">i</code>, 
               linear probing checks the next slot <code className="text-indigo-300">(i+1) % size</code>. 
               It continues until an empty slot is found or the table is full.
             </p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4">
             <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-amber-400" />
                <h4 className="font-bold text-sm uppercase">Clustering Effect</h4>
             </div>
             <p className="text-slate-400 text-xs leading-relaxed">
               Linear probing can lead to <strong>Primary Clustering</strong>, 
               where long runs of occupied slots build up, increasing search time for keys that hash into or near the cluster.
             </p>
             <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-slate-500">Search Efficiency</span>
                   <span className="text-emerald-400">O(1) Avg</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-4/5 h-full bg-emerald-500" />
                </div>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
