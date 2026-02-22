import { Node, Edge } from '@xyflow/react';
import type { CanvasNodeData, ExecutionOutput } from '@/types/canvas';
import { runWorkflow } from './executor';
import { NODE_TYPE_MAP } from './nodeTypes';

export type ValidationRuleType =
  | 'node_exists'
  | 'node_count'
  | 'connection_exists'
  | 'node_config'
  | 'output_contains'
  | 'output_key_exists'
  | 'logic_check'
  | 'no_errors';

export interface ValidationRule {
  id: string;
  type: ValidationRuleType;
  params: Record<string, unknown>;
  errorMessageHe: string;
  errorMessageEn: string;
  hintHe?: string;
  hintEn?: string;
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  results: {
    ruleId: string;
    passed: boolean;
    feedbackHe: string;
    feedbackEn: string;
    hint?: string;
  }[];
}

function getNodeLabel(node: Node<CanvasNodeData>, locale: 'he' | 'en'): string {
  const type = node.type ?? '';
  const def = NODE_TYPE_MAP.get(type);
  if (def) return locale === 'he' && def.labelHe ? def.labelHe : def.labelEn ?? def.label;
  return (node.data?.label as string) || type || node.id;
}

function getNodesByType(nodes: Node<CanvasNodeData>[], nodeType: string): Node<CanvasNodeData>[] {
  return nodes.filter((n) => (n.type ?? '') === nodeType);
}

function getNodeByLabel(
  nodes: Node<CanvasNodeData>[],
  label: string,
  locale: 'he' | 'en'
): Node<CanvasNodeData> | undefined {
  return nodes.find(
    (n) => getNodeLabel(n, locale) === label || getNodeLabel(n, 'en') === label
  );
}

function deepGet(obj: unknown, key: string): unknown {
  if (obj == null || typeof obj !== 'object') return undefined;
  const parts = key.split('.');
  let current: unknown = obj;
  for (const p of parts) {
    current = (current as Record<string, unknown>)?.[p];
    if (current === undefined) return undefined;
  }
  return current;
}

/** Call when a validation rule fails to log mistake (optional, client can call API). */
export async function logMistake(lessonId: string, nodeType: string, ruleId: string): Promise<void> {
  try {
    await fetch('/api/user/mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, nodeType, ruleId }),
    });
  } catch {
    // ignore
  }
}

export async function validateWorkflow(
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
  rules: ValidationRule[] | null | undefined,
  locale: 'he' | 'en' = 'he',
  lessonId?: string
): Promise<ValidationResult> {
  const results: ValidationResult['results'] = [];
  let score = 0;
  const total = rules?.length ?? 0;
  const pointsPerRule = total > 0 ? Math.floor(100 / total) : 0;

  let executionOutputs: ExecutionOutput[] = [];
  try {
    executionOutputs = await runWorkflow(nodes, edges);
  } catch {
    executionOutputs = [];
  }

  if (!rules || rules.length === 0) {
    return {
      passed: true,
      score: 100,
      results: [{ ruleId: '_', passed: true, feedbackHe: 'אין כללים', feedbackEn: 'No rules' }],
    };
  }

  for (const rule of rules) {
    const hint = locale === 'he' ? rule.hintHe : rule.hintEn;
    let passed = false;
    let feedbackHe = rule.errorMessageHe;
    let feedbackEn = rule.errorMessageEn;

    switch (rule.type) {
      case 'node_exists': {
        const nodeType = rule.params.nodeType as string;
        const found = getNodesByType(nodes, nodeType);
        passed = found.length > 0;
        if (passed) {
          feedbackHe = `נוד ${nodeType} קיים`;
          feedbackEn = `Node ${nodeType} exists`;
        }
        break;
      }
      case 'node_count': {
        const nodeType = rule.params.nodeType as string;
        const min = (rule.params.min as number) ?? 1;
        const found = getNodesByType(nodes, nodeType);
        passed = found.length >= min;
        if (passed) {
          feedbackHe = `לפחות ${min} נודים מסוג ${nodeType}`;
          feedbackEn = `At least ${min} node(s) of type ${nodeType}`;
        }
        break;
      }
      case 'connection_exists': {
        const fromLabel = (rule.params.fromLabel as string) ?? (rule.params.from as string);
        const toLabel = (rule.params.toLabel as string) ?? (rule.params.to as string);
        const fromNode = getNodeByLabel(nodes, fromLabel, locale) ?? getNodeByLabel(nodes, fromLabel, 'en');
        const toNode = getNodeByLabel(nodes, toLabel, locale) ?? getNodeByLabel(nodes, toLabel, 'en');
        passed =
          !!fromNode &&
          !!toNode &&
          edges.some((e) => e.source === fromNode.id && e.target === toNode.id);
        if (passed) {
          feedbackHe = `חיבור מ-${fromLabel} ל-${toLabel}`;
          feedbackEn = `Connection from ${fromLabel} to ${toLabel}`;
        }
        break;
      }
      case 'node_config': {
        const nodeLabel = rule.params.nodeLabel as string;
        const field = rule.params.field as string;
        const value = rule.params.value;
        const contains = rule.params.contains as string | undefined;
        const n = getNodeByLabel(nodes, nodeLabel, locale) ?? getNodeByLabel(nodes, nodeLabel, 'en');
        if (!n) {
          passed = false;
          feedbackHe = `נוד ${nodeLabel} לא נמצא`;
          feedbackEn = `Node ${nodeLabel} not found`;
          break;
        }
        const val = (n.data as Record<string, unknown>)?.[field];
        passed = contains
          ? String(val ?? '').includes(contains)
          : value !== undefined
            ? val === value
            : val !== undefined && val !== '';
        if (passed) {
          feedbackHe = `הגדרת ${field} תקינה`;
          feedbackEn = `Config ${field} is set correctly`;
        }
        break;
      }
      case 'output_contains': {
        const nodeLabel = rule.params.nodeLabel as string;
        const key = rule.params.key as string;
        const expectedVal = rule.params.value;
        const out = executionOutputs.find(
          (o) => o.nodeLabel === nodeLabel || getNodeLabel(nodes.find((n) => n.id === o.nodeId)!, locale) === nodeLabel
        );
        if (!out || out.output.length === 0) {
          passed = false;
          break;
        }
        const first = out.output[0] as Record<string, unknown> | undefined;
        const actual = first ? deepGet(first, key) : undefined;
        passed = expectedVal !== undefined ? actual === expectedVal : actual !== undefined;
        if (passed) {
          feedbackHe = `פלט מכיל ${key}`;
          feedbackEn = `Output contains ${key}`;
        }
        break;
      }
      case 'output_key_exists': {
        const nodeLabel = rule.params.nodeLabel as string;
        const key = rule.params.key as string;
        const out = executionOutputs.find((o) => o.nodeLabel === nodeLabel);
        if (!out || out.output.length === 0) {
          passed = false;
          break;
        }
        const first = out.output[0] as Record<string, unknown> | undefined;
        passed = first ? deepGet(first, key) !== undefined : false;
        if (passed) {
          feedbackHe = `מפתח ${key} קיים בפלט`;
          feedbackEn = `Key ${key} exists in output`;
        }
        break;
      }
      case 'logic_check': {
        const nodeLabel = rule.params.nodeLabel as string;
        const conditionField = (rule.params.conditionField as string) ?? 'condition';
        const n = getNodeByLabel(nodes, nodeLabel, locale) ?? getNodeByLabel(nodes, nodeLabel, 'en');
        if (!n) {
          passed = false;
          break;
        }
        const cond = (n.data as Record<string, unknown>)?.[conditionField] as string | undefined;
        passed = !!cond && cond.length > 0;
        if (passed) {
          feedbackHe = `תנאי לוגי מוגדר`;
          feedbackEn = `Logic condition is set`;
        }
        break;
      }
      case 'no_errors': {
        passed = !executionOutputs.some((o) => o.error);
        if (passed) {
          feedbackHe = 'ההרצה הושלמה ללא שגיאות';
          feedbackEn = 'Execution completed with no errors';
        }
        break;
      }
      default:
        passed = false;
    }

    if (passed) score += pointsPerRule;
    else if (lessonId) await logMistake(lessonId, (rule.params.nodeType as string) ?? '', rule.id);

    results.push({
      ruleId: rule.id,
      passed,
      feedbackHe,
      feedbackEn,
      hint: passed ? undefined : hint,
    });
  }

  const finalScore = Math.min(100, score);
  const allPassed = results.every((r) => r.passed);

  return {
    passed: allPassed,
    score: allPassed ? 100 : finalScore,
    results,
  };
}
