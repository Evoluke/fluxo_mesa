import React, { useRef, useState } from 'react';
import { Edge, Node } from 'reactflow';
import { SidebarButton } from './SidebarButton';
import { SidebarNodeItem } from './SidebarNodeItem';
import {
  Wand2,
  Save,
  FileCode,
  Upload,
  Play,
  GitBranch,
  Shield,
  Flag,
  Trash,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  onOrganize: () => void;
  onSaveJson: () => void;
  onSaveBpmn: () => void;
  onLoad: (flow: { nodes: Node[]; edges: Edge[] }) => void;
  onDelete: () => void;
}

export function Sidebar({ onOrganize, onSaveJson, onSaveBpmn, onLoad, onDelete }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [nodesOpen, setNodesOpen] = useState(true);

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
      <div className="sidebar-section">
        <button
          className="sidebar-section-toggle"
          onClick={() => setToolsOpen((o) => !o)}
        >
          {toolsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Ferramentas
        </button>
        {toolsOpen && (
          <div>
            <SidebarButton label="Organizar" icon={Wand2} onClick={onOrganize} />
            <SidebarButton label="Salvar JSON" icon={Save} onClick={onSaveJson} />
            <SidebarButton label="Salvar BPMN" icon={FileCode} onClick={onSaveBpmn} />
            <SidebarButton label="Importar JSON" icon={Upload} onClick={triggerFileSelect} />
            <input
              type="file"
              accept="application/json"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <SidebarButton label="Deletar Selecionados" icon={Trash} onClick={onDelete} />
          </div>
        )}
      </div>
      <div className="sidebar-section">
        <button
          className="sidebar-section-toggle"
          onClick={() => setNodesOpen((o) => !o)}
        >
          {nodesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Nodes
        </button>
        {nodesOpen && (
          <div>
            <SidebarNodeItem nodeType="start" label="Início" icon={Play} onDragStart={onDragStart} />
            <SidebarNodeItem nodeType="decision" label="Decisão" icon={GitBranch} onDragStart={onDragStart} />
            <SidebarNodeItem nodeType="alcada" label="Alçada" icon={Shield} onDragStart={onDragStart} />
            <SidebarNodeItem nodeType="end" label="Fim" icon={Flag} onDragStart={onDragStart} />
          </div>
        )}
      </div>
    </aside>
  );
}
