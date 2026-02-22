'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslations, useLocale } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/lib/hooks/useWindowSize';
import { runWorkflow } from '@/lib/canvas/executor';
import { validateWorkflow } from '@/lib/canvas/validationEngine';
import { nodeTypes } from './nodes';
import { NodeLibrary } from './NodeLibrary';
import { NodeConfigPanel } from './NodeConfigPanel';
import { DataInspector } from './DataInspector';
import { useCanvasStore } from '@/store/canvasStore';
import type { CanvasNodeData } from '@/types/canvas';
import { NODE_TYPES } from '@/lib/canvas/nodeTypes';
import { Button } from '@/components/ui/button';
import { Play, Square, Trash2, Download } from 'lucide-react';
import { GhostOverlay } from './GhostOverlay';

const defaultNodePosition = { x: 250, y: 100 };
const nodeWidth = 160;
let nodeId = 0;
function getId() {
  return `node_${++nodeId}`;
}

type TemplateNode = { type?: string; position?: { x: number; y: number } };

function WorkflowCanvasInner({
  initialNodes,
  initialEdges,
  onRun,
  onValidate,
  onValidateResult,
  mode = 'playground',
  readOnly = false,
  lessonId,
  validationRules,
  userId,
  starterTemplate,
}: {
  initialNodes?: Node<CanvasNodeData>[];
  initialEdges?: Edge[];
  onRun?: (outputs: Awaited<ReturnType<typeof runWorkflow>>) => void;
  onValidate?: (passed: boolean, score: number) => void;
  onValidateResult?: (result: { passed: boolean; score: number; results: { ruleId: string; passed: boolean; feedbackHe: string; feedbackEn: string; hint?: string }[] }) => void;
  mode?: 'learn' | 'challenge' | 'playground';
  readOnly?: boolean;
  lessonId?: string;
  validationRules?: Array<{ id: string; type: string; params: Record<string, unknown>; errorMessageHe: string; errorMessageEn: string }>;
  userId?: string | null;
  starterTemplate?: { nodes: Array<{ type?: string; position?: { x: number; y: number } }>; edges: unknown[] } | null;
}) {
  const t = useTranslations('canvas');
  const locale = useLocale() as 'he' | 'en';
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CanvasNodeData>>(initialNodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges ?? []);
  const templateNodes: TemplateNode[] = starterTemplate?.nodes ?? [];
  const ghostSlots =
    mode === 'learn' && templateNodes.length > 0
      ? templateNodes
          .map((tpl: TemplateNode, idx: number) => {
            const type = tpl.type ?? 'set';
            const sameTypeBefore = templateNodes.slice(0, idx + 1).filter((n: TemplateNode) => n.type === type).length;
            const filled = nodes.filter((n: Node<CanvasNodeData>) => (n.type ?? '') === type).length;
            const show = filled < sameTypeBefore;
            const def = NODE_TYPES.find((n: { type: string }) => n.type === type);
            const label = (locale === 'he' && def?.labelHe) ? def.labelHe : (def?.labelEn ?? def?.label ?? type);
            const pos = tpl.position ?? { x: 250 + (idx % 3) * 200, y: 100 + Math.floor(idx / 3) * 120 };
            return { type, label, position: pos, filled: !show };
          })
          .filter((g: { filled: boolean }) => g.filled === false)
      : [];
  const ghostNodes = useMemo(
    () =>
      ghostSlots.map((slot: { type: string; label: string; position: { x: number; y: number } }, idx: number) => ({
        id: `ghost-${idx}`,
        type: 'ghost',
        position: slot.position,
        data: { label: slot.label } as CanvasNodeData,
        draggable: false,
        selectable: false,
      })),
    [ghostSlots]
  );
  const displayNodes = useMemo(() => [...nodes, ...ghostNodes], [nodes, ghostNodes]);
  const onNodesChangeWrapped = useCallback(
    (changes: NodeChange<Node<CanvasNodeData>>[]) => {
      const nextDisplay = applyNodeChanges(changes, displayNodes);
      setNodes(nextDisplay.filter((n) => !String(n.id).startsWith('ghost-')));
    },
    [displayNodes, setNodes]
  );
  const onEdgesChangeWrapped = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );
  const [configNode, setConfigNode] = useState<Node<CanvasNodeData> | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [outputs, setOutputs] = useState<Awaited<ReturnType<typeof runWorkflow>>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const setStoreNodes = useCanvasStore((s) => s.setNodes);
  const setStoreEdges = useCanvasStore((s) => s.setEdges);
  useEffect(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
  }, [nodes, edges, setStoreNodes, setStoreEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const dataStr = event.dataTransfer.getData('application/json');
      let defaultData: Record<string, unknown> = {};
      try {
        defaultData = dataStr ? JSON.parse(dataStr) : {};
      } catch {}
      if (!type) return;
      const def = NODE_TYPES.find((n) => n.type === type);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const label = (def?.defaultData?.label as string) ?? def?.label ?? type;
      const newNode: Node<CanvasNodeData> = {
        id: getId(),
        type: type as never,
        position,
        data: { ...def?.defaultData, ...defaultData, label } as CanvasNodeData,
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, screenToFlowPosition]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<CanvasNodeData>) => {
    if (readOnly) return;
    setConfigNode(node);
    setConfigOpen(true);
  }, [readOnly]);

  const onPaneClick = useCallback(() => {
    setConfigNode(null);
    setSelectedNodeId(null);
  }, []);

  const handleSaveNode = useCallback(
    (nodeId: string, data: CanvasNodeData) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data } : n))
      );
      setConfigOpen(false);
      setConfigNode(null);
    },
    [setNodes]
  );

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutputs([]);
    try {
      const result = await runWorkflow(nodes, edges);
      setOutputs(result);
      onRun?.(result);
      const hasError = result.some((r) => r.error);
      if (!hasError && result.length > 0) {
        toast.success(t('runSuccess'));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else if (hasError) {
        toast.error(t('runError'));
      }
    } catch (err) {
      toast.error(t('runError'));
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, onRun, t]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setOutputs([]);
    setSelectedNodeId(null);
    toast.success(t('canvasCleared'));
  }, [setNodes, setEdges, t]);

  const handleExport = useCallback(() => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('exported'));
  }, [nodes, edges, t]);

  useEffect(() => {
    const handler = async () => {
      if (!validationRules?.length || !onValidateResult) return;
      const result = await validateWorkflow(nodes, edges, validationRules as import('@/lib/canvas/validationEngine').ValidationRule[], locale, lessonId);
      onValidateResult(result);
      if (result.passed) {
        toast.success(t('runSuccess'));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };
    window.addEventListener('workflow-validate', handler);
    return () => window.removeEventListener('workflow-validate', handler);
  }, [nodes, edges, validationRules, locale, lessonId, onValidateResult, t]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && !readOnly) {
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [readOnly, setNodes, setEdges, handleExport]);

  return (
    <div className="flex h-full w-full">
      {!readOnly && (
        <NodeLibrary
          onDragStart={() => {}}
          locale="he"
        />
      )}
      <div className="flex-1 flex flex-col h-full">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapped}
          onEdgesChange={onEdgesChangeWrapped}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
          deleteKeyCode={readOnly ? null : 'Delete'}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="rgba(255,255,255,0.05)" />
          <Controls className="!bg-surface !border-white/10" />
          <MiniMap className="!bg-surface !border-white/10" />
          <Panel position="bottom-center" className="flex gap-2 mb-4">
            {!readOnly && (
              <>
                <Button size="sm" onClick={handleRun} disabled={isRunning} className="gap-1">
                  <Play className="w-4 h-4" />
                  {t('run')}
                </Button>
                <Button size="sm" variant="outline" onClick={handleStop} disabled={!isRunning} className="gap-1">
                  <Square className="w-4 h-4" />
                  {t('stop')}
                </Button>
                <Button size="sm" variant="outline" onClick={handleClear} className="gap-1">
                  <Trash2 className="w-4 h-4" />
                  {t('clear')}
                </Button>
                <Button size="sm" variant="outline" onClick={handleExport} className="gap-1">
                  <Download className="w-4 h-4" />
                  {t('export')}
                </Button>
              </>
            )}
          </Panel>
        </ReactFlow>
        <NodeConfigPanel
          node={configNode}
          open={configOpen}
          onOpenChange={setConfigOpen}
          onSave={handleSaveNode}
        />
      </div>
      <DataInspector
        outputs={outputs}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
      />
      <AnimatePresence>
        {showConfetti && width && height && (
          <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
        )}
      </AnimatePresence>
    </div>
  );
}

export function WorkflowCanvas(
  props: {
    initialNodes?: Node<CanvasNodeData>[];
    initialEdges?: Edge[];
    onRun?: (outputs: Awaited<ReturnType<typeof runWorkflow>>) => void;
    onValidate?: (passed: boolean, score: number) => void;
    onValidateResult?: (result: { passed: boolean; score: number; results: { ruleId: string; passed: boolean; feedbackHe: string; feedbackEn: string; hint?: string }[] }) => void;
    mode?: 'learn' | 'challenge' | 'playground';
    readOnly?: boolean;
    lessonId?: string;
    validationRules?: Array<{ id: string; type: string; params: Record<string, unknown>; errorMessageHe: string; errorMessageEn: string }>;
    userId?: string | null;
    starterTemplate?: { nodes: Array<{ type?: string; position?: { x: number; y: number } }>; edges: unknown[] } | null;
  }
) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
