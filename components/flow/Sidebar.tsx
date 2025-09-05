import React, { useRef } from 'react';
import { Edge, Node } from 'reactflow';
import { SidebarButton } from './SidebarButton';
import { SidebarNodeItem } from './SidebarNodeItem';
import { Wand2, Save, Upload, Play, GitBranch, Shield, Flag, Trash } from 'lucide-react';

interface SidebarProps {
  onOrganize: () => void;
  onSave: () => void;
  onLoad: (flow: { nodes: Node[]; edges: Edge[] }) => void;
  onDelete: () => void;
}

export function Sidebar({ onOrganize, onSave, onLoad, onDelete }: SidebarProps) {
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
    <aside className="sidebar">
      <SidebarButton label="Organizar" icon={Wand2} onClick={onOrganize} />
      <SidebarButton label="Salvar JSON" icon={Save} onClick={onSave} />
      <SidebarButton label="Importar JSON" icon={Upload} onClick={triggerFileSelect} />
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <SidebarButton label="Deletar Selecionados" icon={Trash} onClick={onDelete} />
      <SidebarNodeItem nodeType="start" label="Início" icon={Play} onDragStart={onDragStart} />
      <SidebarNodeItem nodeType="decision" label="Decisão" icon={GitBranch} onDragStart={onDragStart} />
      <SidebarNodeItem nodeType="alcada" label="Alçada" icon={Shield} onDragStart={onDragStart} />
      <SidebarNodeItem nodeType="end" label="Fim" icon={Flag} onDragStart={onDragStart} />
    </aside>
  );
}
