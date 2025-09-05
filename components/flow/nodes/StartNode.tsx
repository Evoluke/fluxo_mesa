import { Handle, NodeProps, Position } from 'reactflow';

export function StartNode({ data }: NodeProps) {
  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 4, background: '#e2f7e1' }}>
      {data.label || 'Início'}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
