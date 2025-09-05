interface SidebarProps {
  onOrganize: () => void;
}

export function Sidebar({ onOrganize }: SidebarProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
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
