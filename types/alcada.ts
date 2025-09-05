export enum AlcadaTipo {
  ASSISTENTE_1 = 'assistente_1',
  ASSISTENTE_2 = 'assistente_2',
  ASSISTENTE_3 = 'assistente_3',
  ANALISTA_1 = 'analista_1',
  ANALISTA_2 = 'analista_2',
  ANALISTA_3 = 'analista_3',
  GERENTE_REGIONAL = 'gerente_regional',
  GERENTE_SEDE = 'gerente_sede',
}

export const ALCADA_LABELS: Record<AlcadaTipo, string> = {
  [AlcadaTipo.ASSISTENTE_1]: 'Assistente 1',
  [AlcadaTipo.ASSISTENTE_2]: 'Assistente 2',
  [AlcadaTipo.ASSISTENTE_3]: 'Assistente 3',
  [AlcadaTipo.ANALISTA_1]: 'Analista 1',
  [AlcadaTipo.ANALISTA_2]: 'Analista 2',
  [AlcadaTipo.ANALISTA_3]: 'Analista 3',
  [AlcadaTipo.GERENTE_REGIONAL]: 'Gerente Regional',
  [AlcadaTipo.GERENTE_SEDE]: 'Gerente Sede',
};

export interface AlcadaData {
  label: string;
  levels: AlcadaTipo[];
}
