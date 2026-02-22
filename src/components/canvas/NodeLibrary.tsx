'use client';

import { useCallback } from 'react';
import { NODE_TYPES } from '@/lib/canvas/nodeTypes';
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

const CATEGORY_ORDER: Array<'trigger' | 'core' | 'integration' | 'ai'> = ['trigger', 'core', 'integration', 'ai'];

interface NodeLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string, defaultData: Record<string, unknown>) => void;
  locale?: 'he' | 'en';
}

const CANVAS_LABELS: Record<string, string> = {
  nodeLibrary: 'ספריית נודים',
  category_trigger: 'טריגרים',
  category_core: 'ליבה',
  category_integration: 'אינטגרציות',
  category_ai: 'AI',
};

export function NodeLibrary({ onDragStart, locale = 'he' }: NodeLibraryProps) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    nodes: NODE_TYPES.filter((n) => n.category === cat),
  }));

  const handleDragStart = useCallback(
    (e: React.DragEvent, type: string, defaultData: Record<string, unknown>) => {
      e.dataTransfer.setData('application/reactflow', type);
      e.dataTransfer.setData('application/json', JSON.stringify(defaultData ?? {}));
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(e, type, defaultData);
    },
    [onDragStart]
  );

  return (
    <div className="w-56 h-full bg-surface border-r border-white/10 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-text-primary">{t('nodeLibrary')}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {grouped.map(({ category, nodes }) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 px-1">
              {CANVAS_LABELS[`category_${category}`] ?? category}
            </h4>
            <div className="space-y-1">
              {nodes.map((node) => {
                const Icon = iconMap[node.icon] ?? Icons.Circle;
                const label = locale === 'he' && node.labelHe ? node.labelHe : node.labelEn ?? node.label;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type, node.defaultData ?? { label: node.label })}
                    className={cn(
                      'flex items-center gap-2 px-2 py-2 rounded-lg cursor-grab active:cursor-grabbing',
                      'border-2 border-transparent hover:border-primary/50 bg-background/50 hover:bg-surface transition-colors'
                    )}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: node.bgColor, border: `1px solid ${node.color}` }}
                    >
                      <span style={{ color: node.color }}><Icon className="w-3.5 h-3.5" /></span>
                    </div>
                    <span className="text-sm text-text-primary truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
