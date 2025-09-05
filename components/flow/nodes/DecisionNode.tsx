import { useState, ChangeEvent } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { DecisionData, DecisionType, RiskLevel } from '../../../types/decision';
import { GitBranch } from 'lucide-react';

export function DecisionNode({ data }: NodeProps<DecisionData>) {
  const [type, setType] = useState<DecisionType>(data.decisionType || DecisionType.RISCO);
  const [risk, setRisk] = useState<RiskLevel>(data.riskLevel || RiskLevel.MEDIO);
  const [from, setFrom] = useState<number | undefined>(data.from);
  const [to, setTo] = useState<number | undefined>(data.to);

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as DecisionType;
    setType(newType);
    data.decisionType = newType;
    if (newType === DecisionType.RISCO) {
      data.from = undefined;
      data.to = undefined;
    } else {
      data.riskLevel = undefined;
    }
  };

  const handleRiskChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newRisk = e.target.value as RiskLevel;
    setRisk(newRisk);
    data.riskLevel = newRisk;
  };

  const handleFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    setFrom(value);
    data.from = value;
  };

  const handleToChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    setTo(value);
    data.to = value;
  };

  return (
    <div
      style={{
        padding: 10,
        border: '1px solid #555',
        borderRadius: 4,
        background: '#e2e2f7',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <GitBranch size={16} />
        {data.label || 'Decisão'}
      </div>
      <div style={{ marginTop: 4 }}>
        <select value={type} onChange={handleTypeChange}>
          <option value={DecisionType.RISCO}>Tipo de risco</option>
          <option value={DecisionType.ENDIVIDAMENTO}>Valor de endividamento</option>
          <option value={DecisionType.PROPOSTA}>Valor da proposta</option>
        </select>
      </div>
      {type === DecisionType.RISCO && (
        <div style={{ marginTop: 4 }}>
          <select value={risk} onChange={handleRiskChange}>
            <option value={RiskLevel.ALTO}>Alto</option>
            <option value={RiskLevel.MEDIO}>Médio</option>
            <option value={RiskLevel.BAIXO}>Baixo</option>
          </select>
        </div>
      )}
      {(type === DecisionType.ENDIVIDAMENTO || type === DecisionType.PROPOSTA) && (
        <div style={{ marginTop: 4 }}>
          <input
            type="number"
            placeholder="de"
            value={from ?? ''}
            onChange={handleFromChange}
            style={{ width: 60, marginRight: 4 }}
          />
          <input
            type="number"
            placeholder="até"
            value={to ?? ''}
            onChange={handleToChange}
            style={{ width: 60 }}
          />
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
