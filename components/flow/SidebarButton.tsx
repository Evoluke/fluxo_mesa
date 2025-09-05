import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SidebarButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function SidebarButton({ label, icon: Icon, onClick }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 mb-2 px-2 py-1 border border-gray-600 rounded hover:bg-gray-100"
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
