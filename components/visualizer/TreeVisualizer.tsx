
import React, { useState } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { GitBranch, Plus, Trash2, Search, Info } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '../../utils/cn';

const motion = motionBase as any;

interface BSTNode {
  value: number;
  left?: BSTNode;
  right?: BSTNode;
  id: string;
}

export const TreeVisualizer: React.FC = () => {
  const [root, setRoot] = useState<BSTNode | null>({
    id: 'root',
    value: 50,
    left: { id: 'l1', value: 30, left: { id: 'l1l', value: 20 }, right: { id: 'l1r', value: 40 } },
    right: { id: 'r1', value: 70, left: { id: 'r1l', value: 60 }, right: { id: 'r1r', value: 80 } }
  });
  const [inputValue, setInputValue] = useState("");

  const insert = (node: BSTNode | null, val: number): BSTNode => {
    if (!node) return { id: Math.random().toString(36).substr(2, 9), value: val };
    if (val < node.value) node.left = insert(node.left || null, val);
    else node.right = insert(node.right || null, val);
    return { ...node };
  };

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setRoot(insert(root, val));
    setInputValue("");
  };

  // Fix: Changed JSX.Element | null to React.ReactNode to resolve namespace error
  const renderTree = (node: BSTNode | null, x: number, y: number, offset: number): React.ReactNode => {
    if (!node) return null;

    return (
      <g key={node.id}>
        {node.left && (
          <line 
            x1={x} y1={y} x2={x - offset} y2={y + 80} 
            stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" 
          />
        )}
        {node.right && (
          <line 
            x1={x} y1={y} x2={x + offset} y2={y + 80} 
            stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" 
          />
        )}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <circle 
            cx={x} cy={y} r="22" 
            className="fill-slate-900 stroke-indigo-500/50" 
            strokeWidth="2" 
          />
          <text 
            x={x} y={y + 5} 
            textAnchor="middle" 
            className="fill-white font-bold text-sm"
          >
            {node.value}
          </text>
        </motion.g>
        {renderTree(node.left || null, x - offset, y + 80, offset / 1.8)}
        {renderTree(node.right || null, x + offset, y + 80, offset / 1.8)}
      </g>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      <GlassCard enableTilt={false} className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <GitBranch className="text-emerald-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Binary Search Tree</h3>
              <p className="text-slate-400 text-sm">Sorted Hierarchical Structure</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input 
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Value"
              className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm"
            />
            <button 
              onClick={handleInsert}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus size={16} /> Insert
            </button>
            <button 
              onClick={() => setRoot(null)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl border border-white/5 text-sm font-bold transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="h-[400px] bg-slate-900/20 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
            {root ? renderTree(root, 400, 50, 180) : (
              <text x="400" y="200" textAnchor="middle" className="fill-slate-600 font-mono italic">
                Empty Tree. Add a root node.
              </text>
            )}
          </svg>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <GlassCard className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="text-indigo-400 w-5 h-5" />
              <h4 className="font-bold">BST Properties</h4>
            </div>
            <ul className="text-slate-400 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <span>Left subtree of a node contains only nodes with keys <span className="text-indigo-400">less than</span> the node's key.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <span>Right subtree contains nodes with keys <span className="text-indigo-400">greater than</span> the node's key.</span>
              </li>
            </ul>
         </GlassCard>
         <GlassCard className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="text-emerald-400 w-5 h-5" />
              <h4 className="font-bold">Traversal Speeds</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Average</p>
                  <p className="text-xl font-mono text-emerald-400">O(log n)</p>
               </div>
               <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Worst Case</p>
                  <p className="text-xl font-mono text-rose-400">O(n)</p>
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
};
