import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SidebarNodeItemProps {
  nodeType: string;
  label: string;
  icon: LucideIcon;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export function SidebarNodeItem({ nodeType, label, icon: Icon, onDragStart }: SidebarNodeItemProps) {
  return (
    <div
      className="sidebar-item"
      draggable
      onDragStart={(event) => onDragStart(event, nodeType)}
    >
      <Icon size={16} />
      {label}
    </div>
  );
}
