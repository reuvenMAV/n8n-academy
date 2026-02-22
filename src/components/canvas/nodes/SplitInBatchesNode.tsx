'use client';

import { memo } from 'react';
import { BaseNode } from './BaseNode';
import { getNodeDefinition } from '@/lib/canvas/nodeTypes';

function SplitInBatchesNodeComponent(props: import('@xyflow/react').NodeProps) {
  const def = getNodeDefinition('splitInBatches');
  if (!def) return null;
  return (
    <BaseNode
      {...props}
      color={def.color}
      bgColor={def.bgColor}
      icon={def.icon}
      label={def.label}
    />
  );
}

export const SplitInBatchesNode = memo(SplitInBatchesNodeComponent);
