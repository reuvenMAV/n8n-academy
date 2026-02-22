'use client';

import { memo } from 'react';
import { BaseNode } from './BaseNode';
import { getNodeDefinition } from '@/lib/canvas/nodeTypes';

function GmailNodeComponent(props: import('@xyflow/react').NodeProps) {
  const def = getNodeDefinition('gmail');
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

export const GmailNode = memo(GmailNodeComponent);
