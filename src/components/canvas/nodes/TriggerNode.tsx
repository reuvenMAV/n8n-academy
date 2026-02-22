'use client';

import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { getNodeDefinition } from '@/lib/canvas/nodeTypes';

function TriggerNodeComponent(props: NodeProps) {
  const def = getNodeDefinition('manualTrigger');
  if (!def) return null;
  return (
    <BaseNode
      {...props}
      color={def.color}
      bgColor={def.bgColor}
      icon={def.icon}
      label={def.label}
      showTarget={false}
    />
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
