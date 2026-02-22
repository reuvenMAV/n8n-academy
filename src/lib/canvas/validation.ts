import { Node, Edge } from '@xyflow/react';
import {
  ValidationRule,
  ValidationResult,
  CanvasNodeData,
  ExecutionOutput,
} from '@/types/canvas';
import { runWorkflow } from './executor';
import { NODE_TYPE_MAP } from './nodeTypes';

function getNodeLabel(node: Node<CanvasNodeData>, locale: 'he' | 'en' = 'he'): string {
  const type = node.type ?? '';
  const def = NODE_TYPE_MAP.get(type);
  if (def) {
    return locale === 'he' && def.labelHe ? def.labelHe : def.labelEn ?? def.label;
  }
  return (node.data?.label as string) || type || node.id;
}

function getNodesByType(nodes: Node<CanvasNodeData>[], nodeType: string): Node<CanvasNodeData>[] {
  return nodes.filter((n) => (n.type ?? '') === nodeType);
}

function getNodeByLabel(nodes: Node<CanvasNodeData>[], label: string, locale: 'he' | 'en' = 'he'): Node<CanvasNodeData> | undefined {
  return nodes.find((n) => getNodeLabel(n, locale) === label);
}

export async function validateWorkflow(
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
  rules: ValidationRule[] | null | undefined,
  locale: 'he' | 'en' = 'he'
): Promise<ValidationResult> {
  const passed: string[] = [];
  const failed: string[] = [];
  const hints: string[] = [];
  let score = 0;
  const totalRules = rules?.length ?? 0;
  const pointsPerRule = totalRules > 0 ? Math.floor(100 / totalRules) : 0;

  if (!rules || rules.length === 0) {
    return { passed: true, score: 100, feedback: { passed: ['No rules to validate'], failed: [], hints: [] } };
  }

  let executionOutputs: ExecutionOutput[] = [];
  try {
    executionOutputs = await runWorkflow(nodes, edges);
  } catch {
    executionOutputs = [];
  }

  for (const rule of rules) {
    if (rule.type === 'node_exists') {
      const found = getNodesByType(nodes, rule.nodeType);
      if (found.length > 0) {
        score += pointsPerRule;
        passed.push(`Node type "${rule.nodeType}" exists`);
      } else {
        failed.push(`Missing node type: ${rule.nodeType}`);
        hints.push(`Add a ${rule.nodeType} node from the sidebar`);
      }
      continue;
    }

    if (rule.type === 'node_count') {
      const found = getNodesByType(nodes, rule.nodeType);
      if (found.length >= rule.min) {
        score += pointsPerRule;
        passed.push(`At least ${rule.min} node(s) of type "${rule.nodeType}"`);
      } else {
        failed.push(`Need at least ${rule.min} ${rule.nodeType} node(s), found ${found.length}`);
      }
      continue;
    }

    if (rule.type === 'connection_exists') {
      const fromNode = getNodeByLabel(nodes, rule.from, locale) ?? nodes.find((n) => getNodeLabel(n, 'en') === rule.from);
      const toNode = getNodeByLabel(nodes, rule.to, locale) ?? nodes.find((n) => getNodeLabel(n, 'en') === rule.to);
      const hasEdge =
        fromNode &&
        toNode &&
        edges.some((e) => e.source === fromNode.id && e.target === toNode.id);
      if (hasEdge) {
        score += pointsPerRule;
        passed.push(`Connection from "${rule.from}" to "${rule.to}" exists`);
      } else {
        failed.push(`Missing connection: ${rule.from} → ${rule.to}`);
        hints.push(`Connect the ${rule.from} node to the ${rule.to} node`);
      }
      continue;
    }

    if (rule.type === 'node_config') {
      const n = getNodeByLabel(nodes, rule.nodeLabel, locale) ?? nodes.find((n) => getNodeLabel(n, 'en') === rule.nodeLabel);
      if (!n) {
        failed.push(`Node "${rule.nodeLabel}" not found`);
        continue;
      }
      const val = (n.data as Record<string, unknown>)?.[rule.field];
      const ok = rule.contains
        ? String(val ?? '').includes(rule.contains)
        : rule.value !== undefined
          ? val === rule.value
          : val !== undefined && val !== '';
      if (ok) {
        score += pointsPerRule;
        passed.push(`Node "${rule.nodeLabel}" has required config for "${rule.field}"`);
      } else {
        failed.push(`Node "${rule.nodeLabel}" config "${rule.field}" ${rule.contains ? `should contain "${rule.contains}"` : 'not set correctly'}`);
      }
      continue;
    }

    if (rule.type === 'output_matches') {
      const out = executionOutputs.find((o) => o.nodeLabel === rule.nodeLabel);
      if (!out) {
        failed.push(`No output for node "${rule.nodeLabel}"`);
        continue;
      }
      const first = out.output[0] as Record<string, unknown> | undefined;
      let match = true;
      if (first && rule.expectedOutput) {
        for (const [k, v] of Object.entries(rule.expectedOutput)) {
          if (first[k] !== v) {
            match = false;
            break;
          }
        }
      }
      if (match && out.output.length > 0) {
        score += pointsPerRule;
        passed.push(`Output of "${rule.nodeLabel}" matches expected`);
      } else {
        failed.push(`Output of "${rule.nodeLabel}" does not match expected`);
      }
      continue;
    }

    if (rule.type === 'no_errors') {
      const hasError = executionOutputs.some((o) => o.error);
      if (!hasError) {
        score += pointsPerRule;
        passed.push('Execution completed with no errors');
      } else {
        failed.push('Execution had errors');
      }
    }
  }

  const finalScore = Math.min(100, score);
  const allPassed = failed.length === 0;

  return {
    passed: allPassed,
    score: allPassed ? 100 : finalScore,
    feedback: { passed, failed, hints },
  };
}
