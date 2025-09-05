import { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { AlcadaTipo, ALCADA_LABELS, AlcadaData } from '../../../types/alcada';
import { Shield } from 'lucide-react';

export function AlcadaNode({ data }: NodeProps<AlcadaData>) {
  const [selecionado, setSelecionado] = useState<AlcadaTipo>(AlcadaTipo.ASSISTENTE_1);
  const [lista, setLista] = useState<AlcadaTipo[]>(data.levels || []);

  const adicionar = () => {
    if (lista.length >= 5) return;
    if (lista.includes(selecionado)) return;
    const novaLista = [...lista, selecionado];
    setLista(novaLista);
    data.levels = novaLista;
  };

  const mover = (from: number, to: number) => {
    setLista((curr) => {
      const copy = [...curr];
      const item = copy[from];
      copy.splice(from, 1);
      copy.splice(to, 0, item);
      data.levels = copy;
      return copy;
    });
  };

  const remover = (index: number) => {
    setLista((curr) => {
      const copy = curr.filter((_, i) => i !== index);
      data.levels = copy;
      return copy;
    });
  };

  return (
    <div
      style={{
        padding: 10,
        border: '1px solid #555',
        borderRadius: 4,
        background: '#f0f0f0',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <Shield size={16} />
        {data.label || 'Alçada'}
      </div>
      <div style={{ marginBottom: 8 }}>
        <select value={selecionado} onChange={(e) => setSelecionado(e.target.value as AlcadaTipo)}>
          {Object.values(AlcadaTipo).map((tipo) => (
            <option key={tipo} value={tipo}>
              {ALCADA_LABELS[tipo]}
            </option>
          ))}
        </select>
        <button onClick={adicionar} disabled={lista.length >= 5} style={{ marginLeft: 4 }}>
          Adicionar
        </button>
      </div>
      <ul>
        {lista.map((item, index) => (
          <li key={item} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ flex: 1 }}>
              {index + 1}. {ALCADA_LABELS[item]}
            </span>
            <button onClick={() => mover(index, index - 1)} disabled={index === 0} style={{ marginRight: 4 }}>
              ↑
            </button>
            <button
              onClick={() => mover(index, index + 1)}
              disabled={index === lista.length - 1}
              style={{ marginRight: 4 }}
            >
              ↓
            </button>
            <button onClick={() => remover(index)}>✕</button>
          </li>
        ))}
      </ul>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
