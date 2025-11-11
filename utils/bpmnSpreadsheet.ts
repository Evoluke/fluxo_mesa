export interface SpreadsheetRow {
  valorEndividamento: string;
  score: string;
  assistentePA: string;
  consultorPA: string;
  gerenteRelacionamentoPA: string;
  assistenteSRO: string;
  analistaISede: string;
  analistaIISede: string;
  supervisorCredito: string;
  coordenadorSede: string;
  gerenteRegional: string;
  gerenteSede: string;
  superintendente: string;
  diretorSede: string;
  diretorExecutivo: string;
}

type NodeType = 'startEvent' | 'endEvent' | 'userTask' | 'scriptTask' | 'exclusiveGateway';

interface BpmnNode {
  id: string;
  type: NodeType;
  defaultFlow?: string;
  candidateGroups?: string[];
}

interface SequenceFlow {
  id: string;
  sourceRef: string;
  targetRef: string;
  conditionExpression?: string;
}

interface BpmnProcess {
  startEventId: string | null;
  nodes: Record<string, BpmnNode>;
  flowsBySource: Record<string, SequenceFlow[]>;
  flowById: Record<string, SequenceFlow>;
}

const NODE_TAGS: Record<NodeType, string> = {
  startEvent: 'startEvent',
  endEvent: 'endEvent',
  userTask: 'userTask',
  scriptTask: 'scriptTask',
  exclusiveGateway: 'exclusiveGateway',
};

type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO';

type ValueRange = {
  label: string;
  representativeValue: number;
};

const VALUE_RANGES: ValueRange[] = [
  { label: 'até 50 mil', representativeValue: 40000 },
  { label: '50 a 100 mil', representativeValue: 75000 },
  { label: '100 a 150 mil', representativeValue: 125000 },
  { label: '150 a 200 mil', representativeValue: 175000 },
  { label: '200 a 300 mil', representativeValue: 250000 },
  { label: 'acima de 300 mil', representativeValue: 350000 },
];

const RISK_LEVELS: RiskLevel[] = ['BAIXO', 'MEDIO', 'ALTO'];

type GroupColumnKey = Exclude<keyof SpreadsheetRow, 'valorEndividamento' | 'score'>;

interface GroupColumn {
  key: GroupColumnKey;
  label: string;
  groups: string[];
}

const GROUP_COLUMN_CONFIG: GroupColumn[] = [
  { key: 'assistentePA', label: 'Assistente PA', groups: ['assistente.pa'] },
  { key: 'consultorPA', label: 'Consultor PA', groups: ['consultor.pa'] },
  {
    key: 'gerenteRelacionamentoPA',
    label: 'Gerente Relacionamento PA',
    groups: ['gerente_relacionamento.pa', 'gerente.relacionamento.pa'],
  },
  {
    key: 'assistenteSRO',
    label: 'Assistente SRO',
    groups: ['assistente.sede', 'assistente.sro'],
  },
  { key: 'analistaISede', label: 'Analista I Sede', groups: ['analista.sede'] },
  {
    key: 'analistaIISede',
    label: 'Analista II Sede',
    groups: ['analistapl.sede', 'analista2.sede', 'analista.ii.sede'],
  },
  {
    key: 'supervisorCredito',
    label: 'Supervisor Crédito',
    groups: ['supervisor.credito'],
  },
  {
    key: 'coordenadorSede',
    label: 'Coordenador Sede',
    groups: ['coordenador.sede'],
  },
  {
    key: 'gerenteRegional',
    label: 'Gerente Regional',
    groups: ['gerente.pa', 'gerente.regional'],
  },
  { key: 'gerenteSede', label: 'Gerente Sede', groups: ['gerente.sede'] },
  {
    key: 'superintendente',
    label: 'Superintendente',
    groups: ['superintendente', 'superintendente.sede'],
  },
  { key: 'diretorSede', label: 'Diretor Sede', groups: ['diretor.sede'] },
  {
    key: 'diretorExecutivo',
    label: 'Diretor Executivo',
    groups: ['executivo.sede', 'diretor.executivo'],
  },
];

const attributeRegex = /([\w:-]+)="([^"]*)"/g;

function parseAttributes(fragment: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = attributeRegex.exec(fragment)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function parseElements(xml: string, tag: string): Array<{ attrs: Record<string, string>; inner: string }> {
  const results: Array<{ attrs: Record<string, string>; inner: string }> = [];
  const pattern = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'g');
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    results.push({ attrs: parseAttributes(match[1]), inner: match[2] ?? '' });
  }
  const selfClosing = new RegExp(`<${tag}\\b([^>]*)\\/>`, 'g');
  while ((match = selfClosing.exec(xml)) !== null) {
    results.push({ attrs: parseAttributes(match[1]), inner: '' });
  }
  const selfClosingSpaced = new RegExp(`<${tag}\\b([^>]*)\\s\\/>`, 'g');
  while ((match = selfClosingSpaced.exec(xml)) !== null) {
    results.push({ attrs: parseAttributes(match[1]), inner: '' });
  }
  return results;
}

function parseSequenceFlows(xml: string): SequenceFlow[] {
  const flows: SequenceFlow[] = [];
  const withBody = /<sequenceFlow\b([^>]*)>([\s\S]*?)<\/sequenceFlow>/g;
  let match: RegExpExecArray | null;
  while ((match = withBody.exec(xml)) !== null) {
    const attrs = parseAttributes(match[1]);
    const inner = match[2] ?? '';
    const conditionMatch = /<conditionExpression[^>]*>([\s\S]*?)<\/conditionExpression>/i.exec(inner);
    const condition = conditionMatch ? cleanCondition(conditionMatch[1]) : undefined;
    flows.push({
      id: attrs.id,
      sourceRef: attrs.sourceRef,
      targetRef: attrs.targetRef,
      conditionExpression: condition,
    });
  }
  const selfClosing = /<sequenceFlow\b([^>]*)\/>/g;
  while ((match = selfClosing.exec(xml)) !== null) {
    const attrs = parseAttributes(match[1]);
    flows.push({
      id: attrs.id,
      sourceRef: attrs.sourceRef,
      targetRef: attrs.targetRef,
    });
  }
  const selfClosingSpaced = /<sequenceFlow\b([^>]*)\s\/>/g;
  while ((match = selfClosingSpaced.exec(xml)) !== null) {
    const attrs = parseAttributes(match[1]);
    flows.push({
      id: attrs.id,
      sourceRef: attrs.sourceRef,
      targetRef: attrs.targetRef,
    });
  }
  return flows;
}

function cleanCondition(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('@[') && text.endsWith(']')) {
    text = text.slice(2, -1);
  }
  if (text.startsWith('<![CDATA[') && text.endsWith(']]>')) {
    text = text.slice(9, -3);
  }
  return text.trim();
}

function buildProcess(xml: string): BpmnProcess {
  const nodes: Record<string, BpmnNode> = {};
  let startEventId: string | null = null;

  (Object.keys(NODE_TAGS) as NodeType[]).forEach((type) => {
    const tag = NODE_TAGS[type];
    const elements = parseElements(xml, tag);
    elements.forEach(({ attrs }) => {
      const id = attrs.id;
      if (!id) {
        return;
      }
      const node: BpmnNode = {
        id,
        type,
      };
      if (type === 'exclusiveGateway' && attrs.default) {
        node.defaultFlow = attrs.default;
      }
      if (type === 'userTask' && attrs['activiti:candidateGroups']) {
        node.candidateGroups = attrs['activiti:candidateGroups']
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
      nodes[id] = node;
      if (type === 'startEvent' && !startEventId) {
        startEventId = id;
      }
    });
  });

  const flows = parseSequenceFlows(xml);
  const flowsBySource: Record<string, SequenceFlow[]> = {};
  const flowById: Record<string, SequenceFlow> = {};
  flows.forEach((flow) => {
    if (!flow.sourceRef || !flow.targetRef) {
      return;
    }
    if (!flowsBySource[flow.sourceRef]) {
      flowsBySource[flow.sourceRef] = [];
    }
    flowsBySource[flow.sourceRef].push(flow);
    flowById[flow.id] = flow;
  });

  return { startEventId, nodes, flowsBySource, flowById };
}

function evaluateExpression(expression: string | undefined, context: Record<string, unknown>): boolean {
  if (!expression) {
    return true;
  }
  const match = /\$\{([\s\S]+)\}/.exec(expression);
  const raw = match ? match[1] : expression;
  const normalized = raw
    .replace(/\band\b/gi, '&&')
    .replace(/\bor\b/gi, '||')
    .replace(/\bnot\b/gi, '!')
    .replace(/\s+/g, ' ')
    .trim();
  try {
    const keys = Object.keys(context);
    const values = keys.map((key) => context[key]);
    const fn = new Function(...keys, `return (${normalized});`);
    return Boolean(fn(...values));
  } catch (error) {
    console.warn('Não foi possível avaliar expressão BPMN:', expression, error);
    return false;
  }
}

function traverse(
  process: BpmnProcess,
  nodeId: string | undefined,
  context: Record<string, unknown>,
  visited: Set<string>,
  groups: Set<string>
): void {
  if (!nodeId || visited.has(nodeId)) {
    return;
  }
  const node = process.nodes[nodeId];
  if (!node) {
    return;
  }

  const nextVisited = new Set(visited);
  nextVisited.add(nodeId);

  if (node.type === 'userTask' && node.candidateGroups) {
    node.candidateGroups.forEach((group) => groups.add(group));
  }

  const outgoing = process.flowsBySource[nodeId] ?? [];
  const matched: SequenceFlow[] = [];

  outgoing.forEach((flow) => {
    if (!flow.conditionExpression || evaluateExpression(flow.conditionExpression, context)) {
      matched.push(flow);
    }
  });

  if (matched.length === 0 && node.defaultFlow) {
    const defaultFlow = process.flowById[node.defaultFlow];
    if (defaultFlow) {
      matched.push(defaultFlow);
    }
  }

  matched.forEach((flow) => {
    traverse(process, flow.targetRef, context, nextVisited, groups);
  });
}

function buildContext(valorProposta: number, risco: RiskLevel): Record<string, unknown> {
  return {
    valorProposta,
    risco,
    aprovado: true,
    naoTemRiscoBaixo: risco !== 'BAIXO',
    temRiscoBaixo: risco === 'BAIXO',
    temRiscoAlto: risco === 'ALTO',
    ehFaixaPropostaAteCinquentaMil: valorProposta <= 50000,
    ehFaixaPropostaCinquentaMil_CemMil: valorProposta > 50000 && valorProposta <= 100000,
    ehFaixaPropostaCemMil_CentoECinquentaMil: valorProposta > 100000 && valorProposta <= 150000,
    ehFaixaPropostaCentoECinquentaMil_DuzentosMil: valorProposta > 150000 && valorProposta <= 200000,
    ehFaixaPropostaDuzentosMil_TrezentosMil: valorProposta > 200000 && valorProposta <= 300000,
    ehFaixaPropostaMaiorQueTrezentosMil: valorProposta > 300000,
  };
}

function formatScoreLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'BAIXO':
      return 'Baixo';
    case 'MEDIO':
      return 'Médio';
    case 'ALTO':
    default:
      return 'Alto';
  }
}

function groupsToRow(groups: Set<string>, range: ValueRange, risk: RiskLevel): SpreadsheetRow {
  const row: SpreadsheetRow = {
    valorEndividamento: range.label,
    score: formatScoreLabel(risk),
    assistentePA: '',
    consultorPA: '',
    gerenteRelacionamentoPA: '',
    assistenteSRO: '',
    analistaISede: '',
    analistaIISede: '',
    supervisorCredito: '',
    coordenadorSede: '',
    gerenteRegional: '',
    gerenteSede: '',
    superintendente: '',
    diretorSede: '',
    diretorExecutivo: '',
  };

  GROUP_COLUMN_CONFIG.forEach(({ key, groups: columnGroups }) => {
    if (columnGroups.some((group) => groups.has(group))) {
      row[key] = 'x';
    }
  });

  return row;
}

export function generateApprovalMatrix(xml: string): SpreadsheetRow[] {
  const process = buildProcess(xml);
  if (!process.startEventId) {
    return [];
  }

  const rows: SpreadsheetRow[] = [];
  VALUE_RANGES.forEach((range) => {
    RISK_LEVELS.forEach((risk) => {
      const context = buildContext(range.representativeValue, risk);
      const groups = new Set<string>();
      traverse(process, process.startEventId ?? undefined, context, new Set<string>(), groups);
      rows.push(groupsToRow(groups, range, risk));
    });
  });

  return rows;
}

export function rowsToDelimitedContent(rows: SpreadsheetRow[], separator = '/'): string {
  const header = [
    'Valor de Endividamento',
    'Score',
    ...GROUP_COLUMN_CONFIG.map((column) => column.label),
  ];
  const lines = rows.map((row) => [
    row.valorEndividamento,
    row.score,
    ...GROUP_COLUMN_CONFIG.map((column) => row[column.key]),
  ]);
  return [header.join(separator), ...lines.map((line) => line.join(separator))].join('\n');
}
