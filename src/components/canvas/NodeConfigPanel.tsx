'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getNodeDefinition } from '@/lib/canvas/nodeTypes';
import type { Node } from '@xyflow/react';
import type { CanvasNodeData } from '@/types/canvas';

interface NodeConfigPanelProps {
  node: Node<CanvasNodeData> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, data: CanvasNodeData) => void;
}

export function NodeConfigPanel({ node, open, onOpenChange, onSave }: NodeConfigPanelProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const def = node ? getNodeDefinition(node.type ?? '') : null;

  useEffect(() => {
    if (node?.data) {
      setFormData({ ...node.data } as Record<string, unknown>);
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onSave(node.id, { ...node.data, ...formData } as CanvasNodeData);
      onOpenChange(false);
    }
  };

  if (!node || !def) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-white/10 text-text-primary max-w-md">
        <DialogHeader>
          <DialogTitle>{def.label} – Config</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={(formData.label as string) ?? ''}
              onChange={(e) => setFormData((d) => ({ ...d, label: e.target.value }))}
              className="bg-background border-white/20"
            />
          </div>
          {def.configFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'number' ? (
                <Input
                  id={field.key}
                  type="number"
                  value={(formData[field.key] as number) ?? field.default ?? ''}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, [field.key]: Number(e.target.value) || 0 }))
                  }
                  className="bg-background border-white/20"
                />
              ) : (
                <Input
                  id={field.key}
                  value={(formData[field.key] as string) ?? (field.default as string) ?? ''}
                  onChange={(e) => setFormData((d) => ({ ...d, [field.key]: e.target.value }))}
                  className="bg-background border-white/20"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
