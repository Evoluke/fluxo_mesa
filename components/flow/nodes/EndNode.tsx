import { Handle, NodeProps, Position } from 'reactflow';

export function EndNode({ data }: NodeProps) {
  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 4, background: '#fde2e2' }}>
      {data.label || 'Fim'}
      <Handle type="target" position={Position.Top} />
    </div>
  );
}
