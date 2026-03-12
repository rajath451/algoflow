
import React from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Activity, 
  Zap, 
  Settings, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Layers,
  Share2,
  Hash,
  BarChart3,
  Terminal
} from 'lucide-react';
import { cn } from '../utils/cn';
import { ViewType } from '../types';

const motion = motionBase as any;

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems: { icon: any; label: string; view: ViewType }[] = [
  { icon: BarChart3, label: 'Sorting', view: 'Sorting' },
  { icon: Layers, label: 'Linked List', view: 'LinkedList' },
  { icon: GitBranch, label: 'Binary Tree', view: 'BST' },
  { icon: Hash, label: 'Hashing', view: 'Hashing' },
  { icon: Share2, label: 'Graphs', view: 'Graphs' },
  { icon: Terminal, label: 'Playground', view: 'Playground' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, activeView, onViewChange }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 flex flex-col relative z-50"
    >
      <div className="p-6 flex items-center justify-between overflow-hidden whitespace-nowrap">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <Zap className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">ALGO<span className="text-indigo-400">FLOW</span></span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="px-4 mb-4">
        {!isCollapsed && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-4 mb-2">Visualizers</p>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange(item.view)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
              activeView === item.view ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={22} className={cn("min-w-[22px] transition-transform group-hover:scale-110", activeView === item.view && "drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]")} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {activeView === item.view && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition-all">
          <BookOpen size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Docs</span>}
        </button>
        <div className={cn(
          "bg-white/5 rounded-2xl border border-white/5 p-4 flex items-center gap-3",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0" />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-white">Expert User</p>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Online</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
