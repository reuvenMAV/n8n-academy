/**
 * @jest-environment jsdom
 */
import { validateWorkflow, type ValidationRule } from '../src/lib/canvas/validationEngine';
import type { Edge } from '@xyflow/react';

describe('canvas validate', () => {
  it('validateWorkflow with node_exists rule passes when node present', async () => {
    const nodes = [
      { id: '1', type: 'manualTrigger', position: { x: 0, y: 0 }, data: { label: 'Manual Trigger' } },
    ];
    const edges: Edge[] = [];
    const rules: ValidationRule[] = [
      {
        id: 'r1',
        type: 'node_exists',
        params: { nodeType: 'manualTrigger' },
        errorMessageHe: 'חסר',
        errorMessageEn: 'Missing trigger',
      },
    ];
    const result = await validateWorkflow(nodes as never, edges, rules, 'en');
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.results[0].passed).toBe(true);
  });

  it('validateWorkflow with node_exists rule fails when node missing', async () => {
    const nodes: never[] = [];
    const edges: Edge[] = [];
    const rules: ValidationRule[] = [
      {
        id: 'r1',
        type: 'node_exists',
        params: { nodeType: 'manualTrigger' },
        errorMessageHe: 'חסר',
        errorMessageEn: 'Missing trigger',
      },
    ];
    const result = await validateWorkflow(nodes, edges, rules, 'en');
    expect(result.passed).toBe(false);
    expect(result.results[0].passed).toBe(false);
  });
});
