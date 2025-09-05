'use client';

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Sidebar } from './Sidebar';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { DecisionNode } from './nodes/DecisionNode';
import { DecisionType } from '../../types/decision';
import { AlcadaNode } from './nodes/AlcadaNode';

const nodeTypes = { start: StartNode, end: EndNode, decision: DecisionNode, alcada: AlcadaNode };

export default function FlowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (targetNode?.type === 'decision' && edges.some((e) => e.target === targetNode.id)) {
        return;
      }

      if (targetNode?.type === 'alcada' && edges.some((e) => e.target === targetNode.id)) {
        return;
      }

      if (sourceNode?.type === 'alcada' && edges.some((e) => e.source === sourceNode.id)) {
        return;
      }

      setEdges((eds) => addEdge(params, eds));
    },
    [nodes, edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      if (type === 'start' && nodes.some((n) => n.type === 'start')) return;
      if (type === 'end' && nodes.some((n) => n.type === 'end')) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - (reactFlowBounds?.left ?? 0),
        y: event.clientY - (reactFlowBounds?.top ?? 0),
      });
      const id = `${type}-${Date.now()}`;

      const newNode: Node = {
        id,
        type,
        position,
        data: {
          label:
            type === 'start'
              ? 'Início'
              : type === 'end'
                ? 'Fim'
                : type === 'decision'
                  ? 'Decisão'
                  : 'Alçada',
          decisionType: type === 'decision' ? DecisionType.RISCO : undefined,
          levels: type === 'alcada' ? [] : undefined,

        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, nodes]
  );

  const organizeFlow = useCallback(() => {
    if (nodes.length === 0) return;

    const nodeWidth = 180;
    const nodeHeight = 80;
    const horizontalSpacing = 50;
    const verticalSpacing = 50;

    const levelMap: Record<string, number> = {};

    const start = nodes.find((n) => n.type === 'start') || nodes[0];
    const queue: { id: string; level: number }[] = [];
    levelMap[start.id] = 0;
    queue.push({ id: start.id, level: 0 });

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      edges
        .filter((e) => e.source === id)
        .forEach((e) => {
          if (levelMap[e.target] == null) {
            levelMap[e.target] = level + 1;
            queue.push({ id: e.target, level: level + 1 });
          }
        });
    }

    const levels: Record<number, Node[]> = {};
    nodes.forEach((n) => {
      const lvl = levelMap[n.id] ?? 0;
      if (!levels[lvl]) levels[lvl] = [];
      levels[lvl].push(n);
    });

    const newNodes = nodes.map((n) => {
      const lvl = levelMap[n.id] ?? 0;
      const siblings = levels[lvl];
      const index = siblings.findIndex((s) => s.id === n.id);
      return {
        ...n,
        position: {
          x: index * (nodeWidth + horizontalSpacing),
          y: lvl * (nodeHeight + verticalSpacing),
        },
      };
    });

    setNodes(newNodes);
    reactFlowInstance?.fitView();
  }, [nodes, edges, setNodes, reactFlowInstance]);

  const saveFlow = useCallback(() => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    const json = JSON.stringify(flow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fluxo.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [reactFlowInstance]);

  const loadFlow = useCallback(
    (flow: { nodes: Node[]; edges: Edge[] }) => {
      if (!flow) return;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
    },
    [setNodes, setEdges]
  );

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '100%' }}>
        <Sidebar onOrganize={organizeFlow} onSave={saveFlow} onLoad={loadFlow} />
        <div style={{ flex: 1, height: '100%' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <MiniMap style={{ right: 10, bottom: 10 }} />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
