import { Node, Edge } from '@xyflow/react';

export type NodeCategory = 'trigger' | 'core' | 'integration' | 'ai';

export interface NodeTypeDefinition {
  type: string;
  label: string;
  labelHe?: string;
  labelEn?: string;
  category: NodeCategory;
  icon: string;
  color: string;
  bgColor: string;
  configFields: { key: string; label: string; type: 'string' | 'number' | 'boolean' | 'json'; default?: unknown }[];
  defaultData?: Record<string, unknown>;
}

export type ValidationRuleType =
  | 'node_exists'
  | 'node_count'
  | 'connection_exists'
  | 'node_config'
  | 'output_matches'
  | 'no_errors';

export interface ValidationRuleNodeExists {
  type: 'node_exists';
  nodeType: string;
}

export interface ValidationRuleNodeCount {
  type: 'node_count';
  nodeType: string;
  min: number;
}

export interface ValidationRuleConnectionExists {
  type: 'connection_exists';
  from: string;
  to: string;
}

export interface ValidationRuleNodeConfig {
  type: 'node_config';
  nodeLabel: string;
  field: string;
  value?: unknown;
  contains?: string;
}

export interface ValidationRuleOutputMatches {
  type: 'output_matches';
  nodeLabel: string;
  expectedOutput: Record<string, unknown>;
}

export interface ValidationRuleNoErrors {
  type: 'no_errors';
}

export type ValidationRule =
  | ValidationRuleNodeExists
  | ValidationRuleNodeCount
  | ValidationRuleConnectionExists
  | ValidationRuleNodeConfig
  | ValidationRuleOutputMatches
  | ValidationRuleNoErrors;

export interface ValidationResult {
  passed: boolean;
  score: number;
  feedback: {
    passed: string[];
    failed: string[];
    hints: string[];
  };
}

export interface CanvasNodeData {
  label?: string;
  [key: string]: unknown;
}

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge;

export interface ExecutionOutput {
  nodeId: string;
  nodeLabel: string;
  output: unknown[];
  error?: string;
}
