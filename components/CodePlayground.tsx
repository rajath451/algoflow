
import React, { useState, useRef, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Box, 
  Code2, 
  AlertCircle,
  SkipForward,
  Save,
  Cpu,
  History,
  Layout,
  Layers,
  SearchCode
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { cn } from '../utils/cn';
import { transformCodeToGenerator, ExecutionStep } from '../utils/codeTransformer';

type Language = 'javascript' | 'python' | 'c';

const DEFAULT_SNIPPETS: Record<Language, string> = {
  c: `#include <stdio.h>\n#define MAX 10\n\nint create(int num) {\n    return num % MAX;\n}\n\nvoid main() {\n    int a[MAX];\n    int num = 45;\n    int key = create(num);\n    \n    // Simulation of linear probing\n    if (a[key] == -1) {\n        a[key] = num;\n    }\n}`,
  javascript: `let x = 10;\nlet y = 20;\nlet sum = x + y;\nx = 50;\nsum = x + y;`,
  python: `x = 10\ny = 20\nsum = x + y\nx = 50\nsum = x + y`
};

export const CodePlayground: React.FC = () => {
  const [language, setLanguage] = useState<Language>('c');
  const [code, setCode] = useState(DEFAULT_SNIPPETS.c);
  const [currentStep, setCurrentStep] = useState<ExecutionStep | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<ExecutionStep[]>([]);
  
  const generatorRef = useRef<Generator<ExecutionStep> | null>(null);

  useEffect(() => {
    const savedCode = localStorage.getItem('playground-code');
    const savedLang = localStorage.getItem('playground-lang');
    if (savedLang) setLanguage(savedLang as Language);
    if (savedCode) setCode(savedCode);
  }, []);

  useEffect(() => {
    localStorage.setItem('playground-code', code);
    localStorage.setItem('playground-lang', language);
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [code, language]);

  const reset = () => {
    generatorRef.current = null;
    setCurrentStep(null);
    setIsExecuting(false);
    setError(null);
    setHistory([]);
  };

  const handleRun = () => {
    reset();
    const gen = transformCodeToGenerator(code);
    generatorRef.current = gen;
    setIsExecuting(true);
    stepNext(gen);
  };

  const stepNext = (manualGen?: Generator<ExecutionStep>) => {
    const gen = manualGen || generatorRef.current;
    if (!gen) return;

    try {
      const next = gen.next();
      if (next.done) {
        setIsExecuting(false);
        return;
      }
      if (next.value.error) {
        setError(next.value.error);
        setIsExecuting(false);
        return;
      }
      setCurrentStep(next.value);
      setHistory(prev => [...prev, next.value]);
    } catch (err: any) {
      setError(err.message);
      setIsExecuting(false);
    }
  };

  const renderValue = (key: string, val: any) => {
    if (Array.isArray(val)) {
      return (
        <div className="grid grid-cols-5 gap-1 mt-2">
          {val.slice(0, 20).map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "h-8 flex items-center justify-center text-[10px] font-mono rounded border transition-colors",
                v === -1 ? "bg-slate-900 border-white/5 text-slate-700" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 font-bold"
              )}
              title={`Index ${i}`}
            >
              {v === -1 ? '.' : v}
            </motion.div>
          ))}
          {val.length > 20 && (
            <div className="col-span-5 text-[8px] text-slate-600 text-center uppercase tracking-widest mt-1">
              + {val.length - 20} more cells
            </div>
          )}
        </div>
      );
    }
    return (
      <motion.div 
        key={JSON.stringify(val)}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-lg font-mono font-bold text-white truncate"
      >
        {typeof val === 'string' ? `"${val}"` : JSON.stringify(val)}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <GlassCard className="p-4" enableTilt={false}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
              {(['javascript', 'python', 'c'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setCode(DEFAULT_SNIPPETS[lang]); reset(); }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    language === lang ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-tighter">
              <Save size={14} className={isSaved ? "text-emerald-500" : ""} />
              {isSaved ? "Storage Active" : "Unsaved Buffer"}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-400 flex items-center gap-2 text-xs font-bold uppercase">
              <RotateCcw size={16} /> Reset
            </button>
            <button onClick={handleRun} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
              <Play size={16} fill="currentColor" /> Compile & Run
            </button>
            {isExecuting && (
              <button onClick={() => stepNext()} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                <SkipForward size={16} fill="currentColor" /> Step
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        <GlassCard className="lg:col-span-7 flex flex-col p-0 overflow-hidden" enableTilt={false}>
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <SearchCode className="text-indigo-400 w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm tracking-tight uppercase">C-Engine Debugger</h3>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 animate-pulse bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">
              Runtime: <span className="text-white">Active</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto relative font-mono text-sm custom-scrollbar npm-editor bg-slate-950/40">
            <AnimatePresence>
              {currentStep && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, y: (currentStep.lineNumber * 21) + 20 }}
                  className="absolute left-0 right-0 h-[21px] bg-indigo-500/15 border-l-4 border-indigo-500 pointer-events-none z-0"
                />
              )}
            </AnimatePresence>
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language)}
              padding={20}
              className="min-h-full"
              style={{ fontFamily: '"Fira Code", monospace', fontSize: 13, lineHeight: '21px', backgroundColor: 'transparent' }}
            />
          </div>
          {error && (
            <div className="bg-rose-500/10 border-t border-rose-500/20 px-6 py-4 flex items-center gap-3 text-rose-400 text-xs font-mono">
              <AlertCircle size={14} /> <span>{error}</span>
            </div>
          )}
        </GlassCard>

        <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
          <GlassCard className="flex-1 flex flex-col gap-4 overflow-hidden" enableTilt={false}>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Layers className="text-emerald-400 w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-tight">Memory Heap Visualization</h3>
              </div>
              <div className="text-[10px] font-bold text-slate-500">ADDR: 0x4000</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {!currentStep || Object.keys(currentStep.vars).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-20">
                  <Cpu size={64} strokeWidth={1} />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No Allocation</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {Object.entries(currentStep.vars).filter(([_, v]) => v !== undefined).map(([key, val]) => (
                    <motion.div
                      key={key}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/5 rounded-2xl p-4 group hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{key}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/5 text-[8px] font-bold text-slate-600 uppercase">
                          {Array.isArray(val) ? `Array[${val.length}]` : typeof val}
                        </span>
                      </div>
                      {renderValue(key, val)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </GlassCard>

          <GlassCard className="h-40 flex flex-col gap-4 overflow-hidden" enableTilt={false}>
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Terminal className="text-purple-400 w-4 h-4" />
              <h4 className="text-xs font-black uppercase tracking-tight">Execution Trace</h4>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-[10px] font-mono">
              {history.length === 0 ? <p className="text-slate-600 italic">No instructions processed...</p> : 
                [...history].reverse().map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 opacity-60">
                    <span className="text-indigo-500">PC {step.lineNumber + 1}</span>
                    <span className="text-slate-400 truncate">Stack Frame Updated: {Object.keys(step.vars).join(', ')}</span>
                  </div>
                ))
              }
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
