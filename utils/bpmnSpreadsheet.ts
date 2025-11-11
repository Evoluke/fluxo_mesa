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

export type SequenceGroupIndexMap = Partial<Record<GroupColumnKey, number>>;

export interface ApprovalMatrixRow extends SpreadsheetRow {
  sequenceGroupByColumn: SequenceGroupIndexMap;
}

interface GroupColumn {
  key: GroupColumnKey;
  label: string;
  groups: string[];
}

export const GROUP_COLUMN_CONFIG: GroupColumn[] = [
  { key: 'assistentePA', label: 'Assistente PA', groups: ['assistente.pa'] },
  { key: 'consultorPA', label: 'Consultor PA', groups: ['consultor.pa'] },
  {
    key: 'gerenteRelacionamentoPA',
    label: 'Gerente Relacionamento PA',
    groups: ['gerente_relacionamento.pa', 'gerente.relacionamento.pa', 'coordenador.pa'],
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

const GROUP_LOOKUP = new Map<string, GroupColumnKey>();

GROUP_COLUMN_CONFIG.forEach(({ key, groups }) => {
  groups.forEach((group) => GROUP_LOOKUP.set(group, key));
});

export const SPREADSHEET_COLUMNS: Array<{ key: keyof SpreadsheetRow; label: string }> = [
  { key: 'valorEndividamento', label: 'Valor de Endividamento' },
  { key: 'score', label: 'Score' },
  ...GROUP_COLUMN_CONFIG.map(({ key, label }) => ({ key, label })),
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
  groups: Set<string>,
  sequenceGroups: GroupColumnKey[][],
  sequenceGroupSignatures: Set<string>
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
    const columnKeys = new Set<GroupColumnKey>();
    node.candidateGroups.forEach((group) => {
      groups.add(group);
      const columnKey = GROUP_LOOKUP.get(group);
      if (columnKey) {
        columnKeys.add(columnKey);
      }
    });
    if (columnKeys.size > 1) {
      const sortedKeys = Array.from(columnKeys).sort();
      const signature = sortedKeys.join('|');
      if (!sequenceGroupSignatures.has(signature)) {
        sequenceGroupSignatures.add(signature);
        sequenceGroups.push(sortedKeys);
      }
    }
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
    traverse(
      process,
      flow.targetRef,
      context,
      nextVisited,
      groups,
      sequenceGroups,
      sequenceGroupSignatures
    );
  });
}

function buildContext(representativeValue: number, risco: RiskLevel): Record<string, unknown> {
  const valorEndividamento = representativeValue;
  const valorProposta = representativeValue;

  const ehFaixaEndividamentoZero_CinquentaMil =
    valorEndividamento > 0 && valorEndividamento <= 50000;
  const ehFaixaEndividamentoCinquentaMil_CemMil =
    valorEndividamento > 50000 && valorEndividamento <= 100000;
  const ehFaixaEndividamentoCemMil_CentoECinquentaMil =
    valorEndividamento > 100000 && valorEndividamento <= 150000;
  const ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil =
    valorEndividamento > 150000 && valorEndividamento <= 200000;
  const ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil =
    valorEndividamento > 200000 && valorEndividamento <= 250000;
  const ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil =
    valorEndividamento > 250000 && valorEndividamento <= 300000;
  const ehFaixaEndividamentoMaiorQueTrezentosMil = valorEndividamento > 300000;

  const ehFaixaPropostaZero_CinquentaMil = valorProposta <= 50000;
  const ehFaixaPropostaCinquentaMil_CemMil =
    valorProposta > 50000 && valorProposta <= 100000;
  const ehFaixaPropostaCemMil_CentoECinquentaMil =
    valorProposta > 100000 && valorProposta <= 150000;
  const ehFaixaPropostaCentoECinquentaMil_DuzentosMil =
    valorProposta > 150000 && valorProposta <= 200000;
  const ehFaixaPropostaDuzentosMil_TrezentosMil =
    valorProposta > 200000 && valorProposta <= 300000;
  const ehFaixaPropostaMaiorQueTrezentosMil = valorProposta > 300000;
  const ehFaixaPropostaCinquentaMil_CentoECinquentaMil =
    valorProposta > 50000 && valorProposta <= 150000;
  const ehFaixaPropostaCentoECinquentaMil_DuzentosECinquentaMil =
    valorProposta > 150000 && valorProposta <= 250000;
  const ehFaixaPropostaCentoECinquentaMil_TrezentosMil =
    valorProposta > 150000 && valorProposta <= 300000;
  const ehFaixaPropostaCinquentaMil_DuzentosMil =
    valorProposta > 50000 && valorProposta <= 200000;
  const ehFaixaPropostaCinquentaMil_TrezentosMil =
    valorProposta > 50000 && valorProposta <= 300000;
  const ehFaixaPropostaZero_DuzentosECinquentaMil = valorProposta <= 250000;
  const ehFaixaPropostaZero_TrezentosMil = valorProposta <= 300000;

  return {
    valorEndividamento,
    valorProposta,
    risco,
    aprovado: true,
    naoTemRiscoBaixo: risco !== 'BAIXO',
    temRiscoBaixo: risco === 'BAIXO',
    temRiscoAlto: risco === 'ALTO',
    temScoreAlto: risco === 'ALTO',
    naoTemScoreAlto: risco !== 'ALTO',
    naoTemScoreBaixo: risco !== 'BAIXO',
    ehFaixaPropostaAteCinquentaMil: valorProposta <= 50000,
    ehFaixaPropostaCinquentaMil_CemMil,
    ehFaixaPropostaCemMil_CentoECinquentaMil,
    ehFaixaPropostaCentoECinquentaMil_DuzentosMil,
    ehFaixaPropostaDuzentosMil_TrezentosMil,
    ehFaixaPropostaMaiorQueTrezentosMil,
    ehFaixaPropostaCinquentaMil_CentoECinquentaMil,
    ehFaixaPropostaCentoECinquentaMil_DuzentosECinquentaMil,
    ehFaixaPropostaCentoECinquentaMil_TrezentosMil,
    ehFaixaPropostaCinquentaMil_DuzentosMil,
    ehFaixaPropostaCinquentaMil_TrezentosMil,
    ehFaixaPropostaZero_CinquentaMil,
    ehFaixaPropostaZero_DuzentosECinquentaMil,
    ehFaixaPropostaZero_TrezentosMil,
    ehFaixaEndividamentoZero_CinquentaMil,
    ehFaixaEndividamentoCinquentaMil_CemMil,
    ehFaixaEndividamentoCemMil_CentoECinquentaMil,
    ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil,
    ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil,
    ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil,
    ehFaixaEndividamentoMaiorQueTrezentosMil,
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

function groupsToRow(
  groups: Set<string>,
  sequenceGroups: GroupColumnKey[][],
  range: ValueRange,
  risk: RiskLevel
): ApprovalMatrixRow {
  const sequenceGroupByColumn: SequenceGroupIndexMap = {};

  sequenceGroups.forEach((keys, index) => {
    if (keys.length < 2) {
      return;
    }
    keys.forEach((key) => {
      sequenceGroupByColumn[key] = index;
    });
  });

  const row: ApprovalMatrixRow = {
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
    sequenceGroupByColumn,
  };

  GROUP_COLUMN_CONFIG.forEach(({ key, groups: columnGroups }) => {
    if (columnGroups.some((group) => groups.has(group))) {
      row[key] = 'x';
    }
  });

  return row;
}

export function generateApprovalMatrix(xml: string): ApprovalMatrixRow[] {
  const process = buildProcess(xml);
  if (!process.startEventId) {
    return [];
  }

  const rows: ApprovalMatrixRow[] = [];
  VALUE_RANGES.forEach((range) => {
    RISK_LEVELS.forEach((risk) => {
      const context = buildContext(range.representativeValue, risk);
      const groups = new Set<string>();
      const sequenceGroups: GroupColumnKey[][] = [];
      const sequenceGroupSignatures = new Set<string>();
      traverse(
        process,
        process.startEventId ?? undefined,
        context,
        new Set<string>(),
        groups,
        sequenceGroups,
        sequenceGroupSignatures
      );
      rows.push(groupsToRow(groups, sequenceGroups, range, risk));
    });
  });

  return rows;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized.padEnd(6, '0');
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rowsToColoredTableImage(
  rows: ApprovalMatrixRow[],
  options?: { columnColors?: string[]; sequenceColors?: string[] }
): string {
  if (typeof document === 'undefined') {
    throw new Error('Geração de imagem disponível apenas no ambiente do navegador.');
  }

  const columns = SPREADSHEET_COLUMNS;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível inicializar o contexto 2D do canvas.');
  }

  const headerFont = '600 16px "Inter", "Segoe UI", Arial, sans-serif';
  const cellFont = '400 14px "Inter", "Segoe UI", Arial, sans-serif';
  const cellPadding = 16;
  const headerHeight = 48;
  const rowHeight = 40;

  const columnWidths = columns.map((column) => {
    context.font = headerFont;
    let maxWidth = context.measureText(column.label).width;
    context.font = cellFont;
    rows.forEach((row) => {
      const value = String(row[column.key] ?? '');
      maxWidth = Math.max(maxWidth, context.measureText(value).width);
    });
    return Math.ceil(maxWidth + cellPadding * 2);
  });

  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const bodyRowCount = Math.max(rows.length, 1);
  const totalHeight = headerHeight + rowHeight * bodyRowCount;

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.textBaseline = 'middle';
  context.textAlign = 'left';

  const defaultSequenceColors = [
    '#fde68a',
    '#bbf7d0',
    '#bfdbfe',
    '#fbcfe8',
    '#ddd6fe',
    '#f3f4f6',
    '#fecaca',
    '#dcfce7',
    '#bae6fd',
    '#e9d5ff',
    '#e2e8f0',
    '#ffe4e6',
    '#fef9c3',
    '#d1d5db',
    '#f5d0fe',
  ];

  const palette = options?.sequenceColors?.length
    ? options.sequenceColors
    : options?.columnColors?.length
    ? options.columnColors
    : defaultSequenceColors;

  let offsetX = 0;
  columns.forEach((column, columnIndex) => {
    const columnWidth = columnWidths[columnIndex];
    context.fillStyle = '#e5e7eb';
    context.fillRect(offsetX, 0, columnWidth, headerHeight);

    context.font = headerFont;
    context.fillStyle = '#111827';
    context.fillText(column.label, offsetX + cellPadding, headerHeight / 2);

    rows.forEach((row, rowIndex) => {
      const y = headerHeight + rowIndex * rowHeight;
      const value = String(row[column.key] ?? '');
      const zebraFill = rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb';
      let cellFill = zebraFill;
      let textColor = '#1f2937';

      if (column.key !== 'valorEndividamento' && column.key !== 'score') {
        const key = column.key as GroupColumnKey;
        const sequenceIndex = row.sequenceGroupByColumn[key];
        if (typeof sequenceIndex === 'number' && value) {
          const sequenceColor = palette[sequenceIndex % palette.length];
          cellFill = hexToRgba(sequenceColor, 0.45);
          textColor = '#111827';
        }
      }

      context.fillStyle = cellFill;
      context.fillRect(offsetX, y, columnWidth, rowHeight);
      context.font = cellFont;
      context.fillStyle = textColor;
      context.fillText(value, offsetX + cellPadding, y + rowHeight / 2);
    });

    offsetX += columnWidth;
  });

  context.strokeStyle = '#d1d5db';
  context.lineWidth = 1;

  let currentX = 0;
  columns.forEach((_, index) => {
    context.beginPath();
    context.moveTo(currentX, 0);
    context.lineTo(currentX, canvas.height);
    context.stroke();
    currentX += columnWidths[index];
  });
  context.beginPath();
  context.moveTo(currentX, 0);
  context.lineTo(currentX, canvas.height);
  context.stroke();

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(canvas.width, 0);
  context.stroke();

  for (let rowIndex = 0; rowIndex <= bodyRowCount; rowIndex += 1) {
    const y = headerHeight + rowIndex * rowHeight;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  return canvas.toDataURL('image/png');
}

export function rowsToDelimitedContent(rows: SpreadsheetRow[], separator = ','): string {
  const header = SPREADSHEET_COLUMNS.map((column) => column.label);
  const lines = rows.map((row) => SPREADSHEET_COLUMNS.map((column) => row[column.key]));
  return [header.join(separator), ...lines.map((line) => line.join(separator))].join('\n');
}
