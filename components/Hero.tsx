
import React from 'react';
import { motion as motionBase } from 'framer-motion';

// Fix: Casting motion to any to bypass environment-specific type errors where motion props are not recognized
const motion = motionBase as any;

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-16 px-8 flex flex-col items-center text-center">
      {/* Background Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-600/20 blur-[100px] -z-10 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 blur-[100px] -z-10 rounded-full"
      />

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
      >
        AlgoFlow
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-lg max-w-2xl"
      >
        Experience data structures and algorithms in high definition. 
        Engineered for clarity, built for the modern web.
      </motion.p>
    </div>
  );
};