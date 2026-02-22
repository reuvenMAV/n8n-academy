import { Node, Edge } from '@xyflow/react';
import { CanvasNodeData, ExecutionOutput } from '@/types/canvas';
import { mockHttpRequest, mockGmail, mockSlack, mockOpenAI, mockGoogleSheets, mockNotion } from './mockEngine';

const TRIGGER_TYPES = ['manualTrigger'];

function getIncomingEdges(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter((e) => e.target === nodeId);
}

function getOutgoingEdges(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter((e) => e.source === nodeId);
}

function getTriggerNodes(nodes: Node<CanvasNodeData>[]): Node<CanvasNodeData>[] {
  return nodes.filter((n) => TRIGGER_TYPES.includes(n.type ?? ''));
}

function getNodeById(id: string, nodes: Node<CanvasNodeData>[]): Node<CanvasNodeData> | undefined {
  return nodes.find((n) => n.id === id);
}

const SAFEEVAL_TIMEOUT_MS = 5000;

async function safeEval(code: string, context: Record<string, unknown>): Promise<unknown> {
  try {
    const fn = new Function(...Object.keys(context), `"use strict"; return (${code});`);
    const resultPromise = Promise.resolve(fn(...Object.values(context)));
    const timeoutPromise = new Promise<undefined>((_, reject) =>
      setTimeout(() => reject(new Error('safeEval timeout')), SAFEEVAL_TIMEOUT_MS)
    );
    return await Promise.race([resultPromise, timeoutPromise]).then(
      (v) => v,
      () => undefined
    );
  } catch {
    return undefined;
  }
}

async function executeNode(
  node: Node<CanvasNodeData>,
  inputData: unknown[][],
  _nodes: Node<CanvasNodeData>[],
  _edges: Edge[]
): Promise<{ output: unknown[]; error?: string; outputFalse?: unknown[] }> {
  const type = node.type ?? 'set';
  const data = (node.data ?? {}) as Record<string, unknown>;
  const flatInput = inputData.flat().filter((x) => x !== undefined);

  const $input = { all: () => flatInput, first: () => flatInput[0], item: (i: number) => flatInput[i] };
  const $json = (flatInput[0] as Record<string, unknown>) ?? {};
  const $node = data;

  try {
    switch (type) {
      case 'manualTrigger':
        return { output: [{ triggered: true, timestamp: Date.now() }] };

      case 'httpRequest': {
        const url = (data.url as string) || 'https://api.example.com';
        const method = (data.method as string) || 'GET';
        const mock = mockHttpRequest({ url, method, body: data.body });
        return { output: [mock] };
      }

      case 'set': {
        const value = data.value ?? $json;
        const mode = (data.mode as string) || 'merge';
        const out = mode === 'merge' ? { ...($json as object), value } : { value };
        return { output: [out] };
      }

      case 'if': {
        const condition = (data.condition as string) || 'true';
        const val = (await safeEval(condition, { $json, $node, $input })) as boolean;
        return { output: val ? flatInput : [], outputFalse: val ? [] : flatInput };
      }

      case 'switch':
        return { output: flatInput };

      case 'code':
      case 'function': {
        const code = (data.code as string) || (data.functionCode as string) || 'return items;';
        const wrapped = `return (function(items, $input, $json, $node) { ${code} })(items, $input, $json, $node);`;
        const result = (await safeEval(wrapped, {
          items: flatInput,
          $input,
          $json,
          $node,
        })) as unknown;
        const arr = Array.isArray(result) ? result : result !== undefined ? [result] : flatInput;
        return { output: arr };
      }

      case 'merge': {
        return { output: flatInput };
      }

      case 'splitInBatches': {
        const size = (data.batchSize as number) || 10;
        const batches: unknown[][] = [];
        for (let i = 0; i < flatInput.length; i += size) {
          batches.push(flatInput.slice(i, i + size));
        }
        return { output: batches.length ? batches[0] : [] };
      }

      case 'wait':
        return { output: flatInput };

      case 'gmail': {
        const mock = mockGmail({
          operation: (data.operation as string) || 'send',
          to: (data.to as string) || '',
          subject: (data.subject as string) || '',
          message: (data.message as string) || '',
        });
        return { output: [mock] };
      }

      case 'slack': {
        const mock = mockSlack({ channel: (data.channel as string) || '', text: (data.text as string) || '' });
        return { output: [mock] };
      }

      case 'googleSheets': {
        const mock = mockGoogleSheets({
          operation: (data.operation as string) || 'read',
          sheetId: (data.sheetId as string) || '',
        });
        return { output: [mock] };
      }

      case 'notion': {
        const mock = mockNotion({
          operation: (data.operation as string) || 'create',
          databaseId: (data.databaseId as string) || '',
        });
        return { output: [mock] };
      }

      case 'openAI': {
        const mock = mockOpenAI({
          model: (data.model as string) || 'gpt-3.5-turbo',
          prompt: (data.prompt as string) || '',
        });
        return { output: [mock] };
      }

      default:
        return { output: flatInput };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { output: [], error: message };
  }
}

export async function runWorkflow(
  nodes: Node<CanvasNodeData>[],
  edges: Edge[]
): Promise<ExecutionOutput[]> {
  const results: ExecutionOutput[] = [];
  const outputByNode = new Map<string, unknown[]>();
  const triggers = getTriggerNodes(nodes);

  const queue: { nodeId: string; inputs: unknown[][] }[] = [];
  for (const t of triggers) {
    queue.push({ nodeId: t.id, inputs: [[]] });
  }

  while (queue.length > 0) {
    const { nodeId, inputs } = queue.shift()!;
    const node = getNodeById(nodeId, nodes);
    if (!node) continue;

    const { output, error, outputFalse } = await executeNode(node, inputs, nodes, edges);
    const label = (node.data?.label as string) || node.type || nodeId;
    results.push({ nodeId, nodeLabel: label, output: output ?? [], error });

    if (error) continue;
    const outList = Array.isArray(output) ? output : [output];
    const falseList = outputFalse !== undefined ? (Array.isArray(outputFalse) ? outputFalse : [outputFalse]) : [];
    outputByNode.set(nodeId, outList);

    const outgoing = getOutgoingEdges(nodeId, edges);
    const isIfNode = node.type === 'if';
    for (const edge of outgoing) {
      const targetId = edge.target;
      const targetNode = getNodeById(targetId, nodes);
      if (!targetNode) continue;
      const inputForTarget = isIfNode
        ? (edge.sourceHandle === 'true' ? outList : edge.sourceHandle === 'false' ? falseList : outList)
        : outList;
      queue.push({ nodeId: targetId, inputs: [inputForTarget] });
    }
  }

  return results;
}
