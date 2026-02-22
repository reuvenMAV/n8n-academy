'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GhostOverlayProps {
  /** Ghost node type to show as placeholder */
  nodeType: string;
  label: string;
  position: { x: number; y: number };
  filled: boolean;
  onWrongDrop?: () => void;
  className?: string;
}

function GhostOverlayComponent({ nodeType, label, position, filled, className }: GhostOverlayProps) {
  return (
    <motion.div
      className={cn(
        'absolute rounded-lg border-2 px-3 py-2 min-w-[120px] flex items-center gap-2',
        filled ? 'opacity-100 border-primary bg-surface' : 'opacity-30 border-dashed border-white/40 bg-white/5'
      )}
      style={{ left: position.x, top: position.y }}
      initial={false}
      animate={filled ? {} : { x: [0, -2, 2, -2, 2, 0] }}
      transition={{ duration: 0.4 }}
    >
      <span className="text-sm font-medium text-text-primary truncate">{label}</span>
    </motion.div>
  );
}

export const GhostOverlay = memo(GhostOverlayComponent);
