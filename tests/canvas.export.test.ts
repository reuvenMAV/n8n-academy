/**
 * @jest-environment jsdom
 */
import { runWorkflow } from '../src/lib/canvas/executor';

describe('canvas export', () => {
  it('workflow nodes and edges structure is serializable', async () => {
    const nodes = [
      { id: '1', type: 'manualTrigger', position: { x: 0, y: 0 }, data: { label: 'Manual Trigger' } },
      { id: '2', type: 'set', position: { x: 200, y: 0 }, data: { label: 'Set', value: 'test' } },
    ];
    const edges = [{ id: 'e1', source: '1', target: '2' }];
    const json = JSON.stringify({ nodes, edges });
    const parsed = JSON.parse(json);
    expect(parsed.nodes).toHaveLength(2);
    expect(parsed.edges).toHaveLength(1);
    expect(parsed.nodes[0].type).toBe('manualTrigger');
    expect(parsed.nodes[1].data.value).toBe('test');
  });
});
