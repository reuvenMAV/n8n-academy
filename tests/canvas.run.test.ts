/**
 * @jest-environment jsdom
 */
import { runWorkflow } from '../src/lib/canvas/executor';

describe('canvas run', () => {
  it('runWorkflow executes HTTP Request node with mock', async () => {
    const nodes = [
      { id: '1', type: 'manualTrigger', position: { x: 0, y: 0 }, data: {} },
      { id: '2', type: 'httpRequest', position: { x: 200, y: 0 }, data: { url: 'https://api.example.com', method: 'GET' } },
    ];
    const edges = [{ id: 'e1', source: '1', target: '2' }];
    const result = await runWorkflow(nodes as never, edges as never);
    const httpOut = result.find((r) => r.nodeId === '2');
    expect(httpOut).toBeDefined();
    expect(httpOut?.error).toBeUndefined();
    expect(httpOut?.output?.[0]).toHaveProperty('status', 200);
  });
});
