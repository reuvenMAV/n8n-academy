'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Play: Icons.Play,
  Globe: Icons.Globe,
  Edit: Icons.Edit3,
  GitBranch: Icons.GitBranch,
  Code: Icons.Code,
  Braces: Icons.Braces,
  Function: Icons.Braces,
  Merge: Icons.Merge,
  Layers: Icons.Layers,
  Clock: Icons.Clock,
  Mail: Icons.Mail,
  MessageCircle: Icons.MessageCircle,
  Table: Icons.Table,
  FileText: Icons.FileText,
  Bot: Icons.Bot,
};

interface BaseNodeProps extends NodeProps {
  color: string;
  bgColor: string;
  icon: string;
  label: string;
  showTarget?: boolean;
  showSourceTrueFalse?: boolean;
}

function BaseNodeComponent({ data, color, bgColor, icon, label, showTarget = true, showSourceTrueFalse = false }: BaseNodeProps) {
  const Icon = iconMap[icon] ?? Icons.Circle;
  const displayLabel = (data?.label as string) || label;

  return (
    <div
      className={cn(
        'rounded-lg border-2 px-3 py-2 min-w-[140px] shadow-lg',
        'border-[var(--node-color)] bg-[var(--node-bg)]'
      )}
      style={
        {
          '--node-color': color,
          '--node-bg': bgColor,
        } as React.CSSProperties
      }
    >
      {showTarget && (
        <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-surface" />
      )}
      <div className="flex items-center gap-2">
        <span style={{ color }}><Icon className="h-4 w-4 shrink-0" /></span>
        <span className="text-sm font-medium text-text-primary truncate">{displayLabel}</span>
      </div>
      <Handle type="source" position={Position.Right} id="source" className="!w-2 !h-2 !border-2 !bg-surface" />
      {showSourceTrueFalse && (
        <>
          <Handle type="source" position={Position.Right} id="true" style={{ top: '30%' }} className="!w-2 !h-2 !border-2 !bg-success" />
          <Handle type="source" position={Position.Right} id="false" style={{ top: '70%' }} className="!w-2 !h-2 !border-2 !bg-error" />
        </>
      )}
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
