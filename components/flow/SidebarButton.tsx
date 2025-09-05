import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SidebarButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function SidebarButton({ label, icon: Icon, onClick }: SidebarButtonProps) {
  return (
    <button className="sidebar-button" onClick={onClick}>
      <Icon size={16} />
      {label}
    </button>
  );
}
