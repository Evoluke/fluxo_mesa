import { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { DecisionData, DecisionType, RiskLevel } from '../../../types/decision';

export function DecisionNode({ data }: NodeProps<DecisionData>) {
  const [type, setType] = useState<DecisionType>(data.decisionType || DecisionType.RISCO);
  const [risk, setRisk] = useState<RiskLevel>(data.riskLevel || RiskLevel.MEDIO);
  const [from, setFrom] = useState<number | undefined>(data.from);
  const [to, setTo] = useState<number | undefined>(data.to);

  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 4, background: '#e2e2f7' }}>
      {data.label || 'Decisão'}
      <div style={{ marginTop: 4 }}>
        <select value={type} onChange={(e) => setType(e.target.value as DecisionType)}>
          <option value={DecisionType.RISCO}>Tipo de risco</option>
          <option value={DecisionType.ENDIVIDAMENTO}>Valor de endividamento</option>
          <option value={DecisionType.PROPOSTA}>Valor da proposta</option>
        </select>
      </div>
      {type === DecisionType.RISCO && (
        <div style={{ marginTop: 4 }}>
          <select value={risk} onChange={(e) => setRisk(e.target.value as RiskLevel)}>
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
            onChange={(e) => setFrom(e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: 60, marginRight: 4 }}
          />
          <input
            type="number"
            placeholder="até"
            value={to ?? ''}
            onChange={(e) => setTo(e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: 60 }}
          />
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
