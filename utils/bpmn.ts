import type { Edge, Node } from 'reactflow';

export function generateBpmnXml(flow: { nodes: Node[]; edges: Edge[] }): string {
  const nodeXml = flow.nodes
    .map((n: Node) => {
      const label = (n.data as { label?: string })?.label || '';
      switch (n.type) {
        case 'start':
          return `<startEvent id="${n.id}" name="${label}" />`;
        case 'end':
          return `<endEvent id="${n.id}" name="${label}" />`;
        case 'decision':
          return `<exclusiveGateway id="${n.id}" name="${label}" />`;
        default:
          return `<task id="${n.id}" name="${label}" />`;
      }
    })
    .join('\n    ');

  const edgeXml = flow.edges
    .map((e: Edge) => `<sequenceFlow id="${e.id}" sourceRef="${e.source}" targetRef="${e.target}" />`)
    .join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"\n` +
    `             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n` +
    `             xmlns:activiti="http://activiti.org/bpmn"\n` +
    `             targetNamespace="http://www.activiti.org/processdef">\n` +
    `  <process id="Process_1" isExecutable="true">\n` +
    `    ${nodeXml}\n` +
    `    ${edgeXml}\n` +
    `  </process>\n` +
    `</definitions>`;
}

