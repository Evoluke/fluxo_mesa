import React, { useRef } from 'react';
import type { Edge, Node } from 'reactflow';
import { ListTree, Save, Upload, CirclePlay, GitBranch, Users, CircleStop } from 'lucide-react';
import { SidebarButton } from './SidebarButton';
import { SidebarNode } from './SidebarNode';

interface SidebarProps {
  onOrganize: () => void;
  onSave: () => void;
  onLoad: (flow: { nodes: Node[]; edges: Edge[] }) => void;
}

export function Sidebar({ onOrganize, onSave, onLoad }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <aside className="w-40 p-3 border-r border-gray-300 bg-gray-50">
      <SidebarButton label="Organizar" icon={ListTree} onClick={onOrganize} />
      <SidebarButton label="Salvar JSON" icon={Save} onClick={onSave} />
      <SidebarButton label="Importar JSON" icon={Upload} onClick={triggerFileSelect} />
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <SidebarNode type="start" label="Início" icon={CirclePlay} />
      <SidebarNode type="decision" label="Decisão" icon={GitBranch} />
      <SidebarNode type="alcada" label="Alçada" icon={Users} />
      <SidebarNode type="end" label="Fim" icon={CircleStop} />
    </aside>
  );
}
