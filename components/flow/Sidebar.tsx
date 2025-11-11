import React, { useRef, useState } from 'react';
import { Edge, Node } from 'reactflow';
import { SidebarButton } from './SidebarButton';
import { SidebarNodeItem } from './SidebarNodeItem';
import {
  Wand2,
  Save,
  FileCode,
  Upload,
  Table,
  Play,
  GitBranch,
  Shield,
  Flag,
  Trash,
  ChevronDown,
  ChevronRight,
  ImageDown,
} from 'lucide-react';
import {
  generateApprovalMatrix,
  rowsToColoredTableImage,
  rowsToDelimitedContent,
} from '../../utils/bpmnSpreadsheet';

interface SidebarProps {
  onOrganize: () => void;
  onSaveJson: () => void;
  onSaveBpmn: () => void;
  onLoad: (flow: { nodes: Node[]; edges: Edge[] }) => void;
  onDelete: () => void;
}

export function Sidebar({ onOrganize, onSaveJson, onSaveBpmn, onLoad, onDelete }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bpmnInputRef = useRef<HTMLInputElement>(null);
  const bpmnImageInputRef = useRef<HTMLInputElement>(null);
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

  const handleBpmnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result ?? '');
        const rows = generateApprovalMatrix(text);
        if (!rows.length) {
          console.warn('BPMN não possui eventos de início válidos para gerar a planilha.');
          return;
        }
        const content = rowsToDelimitedContent(rows);
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = file.name.replace(/\.[^.]+$/, '');
        a.download = `${baseName || 'fluxo'}-alcadas.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Erro ao gerar planilha a partir do arquivo BPMN', err);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const triggerBpmnSelect = () => {
    bpmnInputRef.current?.click();
  };

  const handleBpmnImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result ?? '');
        const rows = generateApprovalMatrix(text);
        if (!rows.length) {
          console.warn('BPMN não possui eventos de início válidos para gerar a imagem.');
          return;
        }
        const dataUrl = rowsToColoredTableImage(rows);
        const link = document.createElement('a');
        link.href = dataUrl;
        const baseName = file.name.replace(/\.[^.]+$/, '');
        link.download = `${baseName || 'fluxo'}-alcadas.png`;
        link.click();
      } catch (err) {
        console.error('Erro ao gerar imagem a partir do arquivo BPMN', err);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const triggerBpmnImageSelect = () => {
    bpmnImageInputRef.current?.click();
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
            <SidebarButton label="Gerar Planilha (BPMN)" icon={Table} onClick={triggerBpmnSelect} />
            <input
              type="file"
              accept=".bpmn,.xml,application/xml,text/xml"
              ref={bpmnInputRef}
              onChange={handleBpmnChange}
              style={{ display: 'none' }}
            />
            <SidebarButton label="Gerar Imagem (BPMN)" icon={ImageDown} onClick={triggerBpmnImageSelect} />
            <input
              type="file"
              accept=".bpmn,.xml,application/xml,text/xml"
              ref={bpmnImageInputRef}
              onChange={handleBpmnImageChange}
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
