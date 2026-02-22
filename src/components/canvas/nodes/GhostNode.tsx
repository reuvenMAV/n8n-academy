'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

function GhostNodeComponent({ data }: NodeProps) {
  const label = (data?.label as string) ?? 'Node';
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed border-white/40 bg-white/5 px-3 py-2 min-w-[120px]',
        'opacity-60 cursor-default pointer-events-none'
      )}
    >
      <span className="text-sm font-medium text-text-primary truncate">{label}</span>
    </div>
  );
}

export const GhostNode = memo(GhostNodeComponent);
