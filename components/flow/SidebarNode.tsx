import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SidebarNodeProps {
  type: string;
  label: string;
  icon: LucideIcon;
}

export function SidebarNode({ type, label, icon: Icon }: SidebarNodeProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 mb-2 px-2 py-1 border border-gray-600 rounded cursor-grab bg-white hover:bg-gray-50"
    >
      <Icon size={16} />
      <span>{label}</span>
    </div>
  );
}
