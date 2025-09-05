import { Handle, NodeProps, Position } from 'reactflow';
import { Flag } from 'lucide-react';

export function EndNode({ data }: NodeProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 10,
        border: '1px solid #555',
        borderRadius: 4,
        background: '#fde2e2',
        position: 'relative',
      }}
    >
      <Flag size={16} />
      {data.label || 'Fim'}
      <Handle type="target" position={Position.Top} />
    </div>
  );
}
