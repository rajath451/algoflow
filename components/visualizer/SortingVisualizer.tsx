
import React, { useState, useEffect, useRef } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SlidersHorizontal, 
  Info, 
  Zap, 
  Terminal, 
  PlusCircle, 
  ChevronRight,
  Settings2
} from 'lucide-react';
import { SortState, SortItem, VisualizerStep, AlgorithmType } from '../../types';
import { 
  bubbleSortGenerator, 
  selectionSortGenerator, 
  insertionSortGenerator,
  generateRandomArray, 
  parseCustomArray,
  ALGO_CODE 
} from '../../algorithms/sorting';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '../../utils/cn';

const motion = motionBase as any;
const SPEED_MS = 150;

export const SortingVisualizer: React.FC = () => {
  const [customInput, setCustomInput] = useState("");
  const [state, setState] = useState<SortState>({
    array: generateRandomArray(15),
    comparingIndices: [],
    swappedIndices: [],
    sortedIndices: [],
    isSorting: false,
    isPaused: true,
    currentAlgo: 'Bubble Sort',
    currentLine: -1,
  });

  const generatorRef = useRef<Generator<VisualizerStep> | null>(null);
  const timerRef = useRef<any>(null);

  const reset = (newArray?: SortItem[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const arr = newArray || generateRandomArray(15);
    setState(prev => ({
      ...prev,
      array: arr,
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: [],
      isSorting: false,
      isPaused: true,
      currentLine: -1,
    }));
    generatorRef.current = null;
  };

  const handleCustomInput = () => {
    const parsed = parseCustomArray(customInput);
    if (parsed.length > 0) {
      reset(parsed);
      setCustomInput("");
    }
  };

  const step = () => {
    if (!generatorRef.current) {
      switch (state.currentAlgo) {
        case 'Bubble Sort': generatorRef.current = bubbleSortGenerator(state.array); break;
        case 'Selection Sort': generatorRef.current = selectionSortGenerator(state.array); break;
        case 'Insertion Sort': generatorRef.current = insertionSortGenerator(state.array); break;
      }
    }

    if (!generatorRef.current) return;

    const next = generatorRef.current.next();
    if (next.done) {
      if (timerRef.current) clearInterval(timerRef.current);
      setState(prev => ({ 
        ...prev, 
        isSorting: false, 
        isPaused: true, 
        comparingIndices: [], 
        swappedIndices: [],
        currentLine: -1 
      }));
      return;
    }

    const { array, comparing, swapped, sorted, line } = next.value;
    setState(prev => ({
      ...prev,
      array,
      comparingIndices: comparing || [],
      swappedIndices: swapped || [],
      sortedIndices: sorted || prev.sortedIndices,
      currentLine: line ?? -1,
    }));
  };

  useEffect(() => {
    if (state.isSorting && !state.isPaused) {
      timerRef.current = setInterval(step, SPEED_MS);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.isSorting, state.isPaused, state.currentAlgo]);

  const toggleSort = () => {
    setState(prev => ({ ...prev, isSorting: true, isPaused: !prev.isPaused }));
  };

  const handleAlgoChange = (algo: AlgorithmType) => {
    setState(prev => ({ ...prev, currentAlgo: algo }));
    reset(state.array);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Configuration Panel */}
      <GlassCard className="flex flex-col gap-6" enableTilt={false}>
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Settings2 className="text-indigo-400 w-6 h-6" />
             </div>
             <div>
                <h3 className="font-bold text-xl">Visualizer Configuration</h3>
                <p className="text-slate-400 text-sm">Select logic and input data</p>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-900 rounded-xl p-1 border border-white/5">
              {(['Bubble Sort', 'Selection Sort', 'Insertion Sort'] as AlgorithmType[]).map((algo) => (
                <button
                  key={algo}
                  onClick={() => handleAlgoChange(algo)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    state.currentAlgo === algo 
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <PlusCircle size={14} /> Custom Array Input
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. 45, 12, 89, 3, 24"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
              />
              <button 
                onClick={handleCustomInput}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/10"
              >
                Load
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Comma separated numbers between 5-100</p>
          </div>

          <div className="flex items-end gap-3">
             <button 
              onClick={() => reset()}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 flex items-center gap-2 text-slate-300 font-medium"
            >
              <RotateCcw size={18} /> New Random
            </button>
            <button 
              onClick={toggleSort}
              className={cn(
                "px-8 py-3 rounded-xl flex items-center gap-3 font-bold transition-all shadow-xl min-w-[140px] justify-center",
                state.isPaused 
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20" 
                  : "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20"
              )}
            >
              {state.isPaused ? (
                <><Play size={20} fill="currentColor" /> Start</>
              ) : (
                <><Pause size={20} fill="currentColor" /> Pause</>
              )}
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Visualization Area */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="flex flex-col gap-8 h-[400px] justify-between overflow-hidden" enableTilt={false}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Live Execution</span>
              </div>
              <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Steps: {state.sortedIndices.length}/{state.array.length} sorted
              </div>
            </div>

            <div className="flex-1 flex items-end gap-1 px-2 relative">
              <AnimatePresence mode="popLayout">
                {state.array.map((item, index) => {
                  const isComparing = state.comparingIndices.includes(index);
                  const isSwapped = state.swappedIndices.includes(index);
                  const isSorted = state.sortedIndices.includes(index);

                  let colorClass = "bg-slate-700/50 border-slate-600/50";
                  if (isComparing) colorClass = "bg-indigo-400 border-indigo-300 shadow-[0_0_20px_rgba(129,140,248,0.5)] z-10 scale-105";
                  if (isSwapped) colorClass = "bg-rose-500 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.6)] z-20 scale-110";
                  if (isSorted) colorClass = "bg-emerald-500/60 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 40 }}
                      style={{ height: `${item.value}%` }}
                      className={cn(
                        "flex-1 rounded-t-lg border transition-all duration-300",
                        colorClass
                      )}
                    >
                      <AnimatePresence>
                        {(isComparing || isSwapped) && (
                           <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-white/10"
                           >
                            {item.value}
                           </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-6 pb-4 border-t border-white/5 pt-4">
               <LegendItem color="bg-slate-700/50" label="Inactive" />
               <LegendItem color="bg-indigo-400" label="Compare" />
               <LegendItem color="bg-rose-500" label="Swapping" />
               <LegendItem color="bg-emerald-500" label="Sorted" />
            </div>
          </GlassCard>
        </div>

        {/* Code Trace Panel */}
        <div className="lg:col-span-1 h-full">
           <GlassCard className="flex flex-col gap-4 h-[400px]" enableTilt={false}>
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Terminal size={18} className="text-indigo-400" />
                <h4 className="font-bold">Logic Tracer</h4>
              </div>
              
              <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1 py-2 custom-scrollbar">
                {ALGO_CODE[state.currentAlgo].map((line, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      backgroundColor: state.currentLine === idx ? "rgba(99, 102, 241, 0.15)" : "transparent",
                      x: state.currentLine === idx ? 4 : 0,
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg flex items-center gap-3 transition-colors",
                      state.currentLine === idx ? "text-indigo-300 border border-indigo-500/20" : "text-slate-500"
                    )}
                  >
                    <span className="w-4 text-[10px] opacity-30 select-none">{idx + 1}</span>
                    <span className="flex-1 truncate">{line}</span>
                    {state.currentLine === idx && (
                      <motion.div layoutId="line-pointer">
                        <ChevronRight size={14} className="text-indigo-400 animate-pulse" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                 <div className="flex items-center justify-between text-xs font-medium uppercase text-slate-500">
                    <span>Performance</span>
                    <span className="text-indigo-400">Stable</span>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(state.sortedIndices.length / state.array.length) * 100}%` }}
                    />
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className={cn("w-2 h-2 rounded-full", color)} />
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
  </div>
);
