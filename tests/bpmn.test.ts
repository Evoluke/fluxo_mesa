import { describe, it, expect } from 'vitest';
import { generateBpmnXml } from '../utils/bpmn';
import type { Node, Edge } from 'reactflow';

describe('generateBpmnXml', () => {
  it('constrói XML BPMN com namespaces e elementos do Activiti', () => {
    const nodes: Node[] = [
      { id: 'start-1', type: 'start', data: { label: 'Início' }, position: { x: 0, y: 0 } },
      { id: 'task-1', type: 'alcada', data: { label: 'Tarefa' }, position: { x: 0, y: 0 } },
      { id: 'end-1', type: 'end', data: { label: 'Fim' }, position: { x: 0, y: 0 } },
    ];
    const edges: Edge[] = [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'end-1' },
    ];

    const xml = generateBpmnXml({ nodes, edges });

    expect(xml).toContain('<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"');
    expect(xml).toContain('xmlns:activiti="http://activiti.org/bpmn"');
    expect(xml).toContain('<process id="Process_1" isExecutable="true">');
    expect(xml).toContain('<startEvent id="start-1" name="Início" />');
    expect(xml).toContain('<task id="task-1" name="Tarefa" />');
    expect(xml).toContain('<endEvent id="end-1" name="Fim" />');
    expect(xml).toContain('<sequenceFlow id="e1" sourceRef="start-1" targetRef="task-1" />');
    expect(xml).toContain('<sequenceFlow id="e2" sourceRef="task-1" targetRef="end-1" />');
  });
});

