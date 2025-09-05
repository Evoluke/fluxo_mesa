import { Handle, NodeProps, Position } from 'reactflow';
import { Play } from 'lucide-react';

export function StartNode({ data }: NodeProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 10,
        border: '1px solid #555',
        borderRadius: 4,
        background: '#e2f7e1',
        position: 'relative',
      }}
    >
      <Play size={16} />
      {data.label || 'Início'}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
