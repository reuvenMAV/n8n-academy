import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { CanvasNodeData, ExecutionOutput } from '@/types/canvas';

interface CanvasState {
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
  executionOutputs: ExecutionOutput[];
  isRunning: boolean;
  setNodes: (nodes: Node<CanvasNodeData>[] | ((prev: Node<CanvasNodeData>[]) => Node<CanvasNodeData>[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setExecutionOutputs: (outputs: ExecutionOutput[]) => void;
  setRunning: (running: boolean) => void;
  reset: () => void;
}

const initialNodes: Node<CanvasNodeData>[] = [];
const initialEdges: Edge[] = [];

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  executionOutputs: [],
  isRunning: false,
  setNodes: (n) =>
    set((s) => ({
      nodes: typeof n === 'function' ? n(s.nodes) : n,
    })),
  setEdges: (e) =>
    set((s) => ({
      edges: typeof e === 'function' ? e(s.edges) : e,
    })),
  setExecutionOutputs: (outputs) => set({ executionOutputs: outputs }),
  setRunning: (running) => set({ isRunning: running }),
  reset: () =>
    set({
      nodes: initialNodes,
      edges: initialEdges,
      executionOutputs: [],
      isRunning: false,
    }),
}));
