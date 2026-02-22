/**
 * @jest-environment jsdom
 */
import { runWorkflow } from '../src/lib/canvas/executor';

describe('canvas drag', () => {
  it('runWorkflow with manual trigger returns triggered output', async () => {
    const nodes = [
      { id: '1', type: 'manualTrigger', position: { x: 0, y: 0 }, data: { label: 'Manual Trigger' } },
    ];
    const edges: { source: string; target: string }[] = [];
    const result = await runWorkflow(nodes as never, edges as never);
    expect(result).toHaveLength(1);
    expect(result[0].nodeLabel).toBe('Manual Trigger');
    expect(result[0].output).toEqual([expect.objectContaining({ triggered: true })]);
  });
});
