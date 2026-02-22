'use client';

import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import { AITutorPanel } from '@/components/ai/AITutorPanel';

export default function PlaygroundPage() {
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <h1 className="text-xl font-bold text-text-primary mb-2">Playground</h1>
      <div className="flex-1 min-h-0 rounded-lg border border-white/10 overflow-hidden">
        <WorkflowCanvas mode="playground" readOnly={false} />
      </div>
      <AITutorPanel />
    </div>
  );
}
