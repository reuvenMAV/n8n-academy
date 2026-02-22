'use client';

import { useTranslations } from 'next-intl';
import { ExecutionOutput } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface DataInspectorProps {
  outputs: ExecutionOutput[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

function JsonTree({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) {
    return <span className="text-text-secondary">null</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-accent">{value ? 'true' : 'false'}</span>;
  }
  if (typeof value === 'number') {
    return <span className="text-success">{value}</span>;
  }
  if (typeof value === 'string') {
    return <span className="text-warning">&quot;{value}&quot;</span>;
  }
  if (Array.isArray(value)) {
    return (
      <div className="pl-2 border-l border-white/10">
        <span className="text-text-secondary">[</span>
        {value.map((item, i) => (
          <div key={i} className="pl-2">
            <JsonTree value={item} depth={depth + 1} />
          </div>
        ))}
        <span className="text-text-secondary">]</span>
      </div>
    );
  }
  if (typeof value === 'object') {
    return (
      <div className="pl-2 border-l border-white/10">
        <span className="text-text-secondary">{'{'}</span>
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="pl-2">
            <span className="text-primary">{k}</span>
            <span className="text-text-secondary">: </span>
            <JsonTree value={v} depth={depth + 1} />
          </div>
        ))}
        <span className="text-text-secondary">{'}'}</span>
      </div>
    );
  }
  return <span>{String(value)}</span>;
}

export function DataInspector({ outputs, selectedNodeId, onSelectNode }: DataInspectorProps) {
  const t = useTranslations('canvas');

  return (
    <div className="w-72 h-full bg-surface border-l border-white/10 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-text-primary">{t('dataInspector')}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {outputs.length === 0 ? (
          <p className="text-text-secondary">{t('runToSeeOutput')}</p>
        ) : (
          <div className="space-y-3">
            {outputs.map((out) => (
              <div
                key={out.nodeId}
                className={cn(
                  'rounded-lg border p-2 cursor-pointer transition-colors',
                  selectedNodeId === out.nodeId
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 hover:border-white/20'
                )}
                onClick={() => onSelectNode(selectedNodeId === out.nodeId ? null : out.nodeId)}
              >
                <div className="font-medium text-text-primary mb-1">{out.nodeLabel}</div>
                {out.error && (
                  <div className="text-error text-xs mb-1">{out.error}</div>
                )}
                <div className="text-text-secondary">
                  {out.output.map((item, i) => (
                    <JsonTree key={i} value={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
