import type { NodeTypes } from '@xyflow/react';
import { TriggerNode } from './TriggerNode';
import { HttpRequestNode } from './HttpRequestNode';
import { SetNode } from './SetNode';
import { IfNode } from './IfNode';
import { SwitchNode } from './SwitchNode';
import { CodeNode } from './CodeNode';
import { FunctionNode } from './FunctionNode';
import { MergeNode } from './MergeNode';
import { SplitInBatchesNode } from './SplitInBatchesNode';
import { WaitNode } from './WaitNode';
import { GmailNode } from './GmailNode';
import { SlackNode } from './SlackNode';
import { GoogleSheetsNode } from './GoogleSheetsNode';
import { NotionNode } from './NotionNode';
import { OpenAINode } from './OpenAINode';
import { GhostNode } from './GhostNode';

export const nodeTypes: NodeTypes = {
  ghost: GhostNode,
  manualTrigger: TriggerNode,
  httpRequest: HttpRequestNode,
  set: SetNode,
  if: IfNode,
  switch: SwitchNode,
  code: CodeNode,
  function: FunctionNode,
  merge: MergeNode,
  splitInBatches: SplitInBatchesNode,
  wait: WaitNode,
  gmail: GmailNode,
  slack: SlackNode,
  googleSheets: GoogleSheetsNode,
  notion: NotionNode,
  openAI: OpenAINode,
} as NodeTypes;

export { TriggerNode, HttpRequestNode, SetNode, IfNode, SwitchNode, CodeNode, FunctionNode, MergeNode, SplitInBatchesNode, WaitNode, GmailNode, SlackNode, GoogleSheetsNode, NotionNode, OpenAINode };
