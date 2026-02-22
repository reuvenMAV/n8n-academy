/**
 * @jest-environment jsdom
 */
import { runWorkflow } from '../src/lib/canvas/executor';

describe('canvas connect', () => {
  it('runWorkflow with trigger -> set passes data', async () => {
    const nodes = [
      { id: '1', type: 'manualTrigger', position: { x: 0, y: 0 }, data: {} },
      { id: '2', type: 'set', position: { x: 200, y: 0 }, data: { label: 'Set', value: 'hello' } },
    ];
    const edges = [{ id: 'e1', source: '1', target: '2' }];
    const result = await runWorkflow(nodes as never, edges as never);
    expect(result.length).toBeGreaterThanOrEqual(2);
    const setOutput = result.find((r) => r.nodeLabel === 'Set' || r.nodeId === '2');
    expect(setOutput?.output).toBeDefined();
    expect(Array.isArray(setOutput?.output)).toBe(true);
  });
});
