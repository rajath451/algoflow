
import React from 'react';
import { motion } from 'framer-motion';
import { useTilt } from '../../hooks/useTilt';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, enableTilt = true }) => {
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt();

  return (
    <motion.div
      style={enableTilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : {}}
      onMouseMove={enableTilt ? handleMouseMove : undefined}
      onMouseLeave={enableTilt ? handleMouseLeave : undefined}
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl",
        className
      )}
    >
      <div style={enableTilt ? { transform: 'translateZ(20px)' } : {}}>
        {children}
      </div>
    </motion.div>
  );
};
