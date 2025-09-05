export enum DecisionType {
  RISCO = 'risco',
  ENDIVIDAMENTO = 'endividamento',
  PROPOSTA = 'proposta',
}

export enum RiskLevel {
  ALTO = 'alto',
  MEDIO = 'medio',
  BAIXO = 'baixo',
}

export interface DecisionData {
  label: string;
  decisionType: DecisionType;
  riskLevel?: RiskLevel;
  from?: number;
  to?: number;
}
