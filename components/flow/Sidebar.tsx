import React, { useRef } from 'react';
import { Edge, Node } from 'reactflow';

interface SidebarProps {
  onOrganize: () => void;
  onSave: () => void;
  onLoad: (flow: { nodes: Node[]; edges: Edge[] }) => void;
}

export function Sidebar({ onOrganize, onSave, onLoad }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const flow = JSON.parse(text);
        onLoad(flow);
      } catch (err) {
        console.error('Invalid JSON', err);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <aside style={{ width: 120, padding: 10, borderRight: '1px solid #ddd', background: '#f7f7f7' }}>
      <button
        onClick={onOrganize}
        style={{
          width: '100%',
          marginBottom: 10,
          padding: 8,
          border: '1px solid #555',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Organizar
      </button>
      <button
        onClick={onSave}
        style={{
          width: '100%',
          marginBottom: 10,
          padding: 8,
          border: '1px solid #555',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Salvar JSON
      </button>
      <button
        onClick={triggerFileSelect}
        style={{
          width: '100%',
          marginBottom: 10,
          padding: 8,
          border: '1px solid #555',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Importar JSON
      </button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div
        onDragStart={(event) => onDragStart(event, 'start')}
        draggable
        style={{ marginBottom: 10, padding: 8, border: '1px solid #555', borderRadius: 4, cursor: 'grab' }}
      >
        Início
      </div>
      <div
        onDragStart={(event) => onDragStart(event, 'decision')}
        draggable
        style={{ marginBottom: 10, padding: 8, border: '1px solid #555', borderRadius: 4, cursor: 'grab' }}
      >
        Decisão
      </div>
      <div
        onDragStart={(event) => onDragStart(event, 'alcada')}
        draggable
        style={{ marginBottom: 10, padding: 8, border: '1px solid #555', borderRadius: 4, cursor: 'grab' }}
      >
        Alçada
      </div>
      <div
        onDragStart={(event) => onDragStart(event, 'end')}
        draggable
        style={{ padding: 8, border: '1px solid #555', borderRadius: 4, cursor: 'grab' }}
      >
        Fim
      </div>
    </aside>
  );
}
