'use client';

import { motion } from 'framer-motion';

interface ExecutionOverlayProps {
  activeNodeIds: string[];
  isRunning: boolean;
}

export function ExecutionOverlay({ activeNodeIds, isRunning }: ExecutionOverlayProps) {
  if (!isRunning || activeNodeIds.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {activeNodeIds.map((id) => (
        <motion.div
          key={id}
          layoutId={`exec-${id}`}
          className="absolute rounded-lg border-2 border-primary bg-primary/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            boxShadow: '0 0 20px rgba(255, 109, 90, 0.5)',
          }}
        />
      ))}
    </div>
  );
}
