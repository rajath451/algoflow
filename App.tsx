
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { SortingVisualizer } from './components/visualizer/SortingVisualizer';
import { LinkedListVisualizer } from './components/visualizer/LinkedListVisualizer';
import { TreeVisualizer } from './components/visualizer/TreeVisualizer';
import { HashingVisualizer } from './components/visualizer/HashingVisualizer';
import { GraphVisualizer } from './components/visualizer/GraphVisualizer';
import { CodePlayground } from './components/CodePlayground';
import { ViewType } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('Sorting');

  const renderContent = () => {
    switch (activeView) {
      case 'Sorting': return <SortingVisualizer />;
      case 'LinkedList': return <LinkedListVisualizer />;
      case 'BST': return <TreeVisualizer />;
      case 'Playground': return <CodePlayground />;
      case 'Hashing': return <HashingVisualizer />;
      case 'Graphs': return <GraphVisualizer />;
      default: return <SortingVisualizer />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* Glow Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
           <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto pb-20">
          <Hero />
          
          <div className="px-8">
             <div className="mb-12">
               <div className="flex items-center gap-3 mb-2">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <motion.span 
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold uppercase tracking-widest text-slate-500 px-4"
                  >
                    {activeView} Workspace
                  </motion.span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
               </div>
             </div>

             <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {renderContent()}
                </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
