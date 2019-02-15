interface Dossard {
  tq: string;
  mm: string;
  ps: string;
  cp: string;
}

interface JudgeSheet {
  competitionId: string;
  danse: string;
  dossards: Dossard[];
  finalSkatingDossardsOrder: number[];
  judgeId: string;
  _id: string;
  _rev: string;
}

interface CompetitionType {
  criteria: number[];
  length: number;
  id: number;
  name: string;
}

interface Competition {
  closed: boolean;
  date: number;
  id: string;
  judgingSystem: number;
  nombreSelection: number;
  titre: string;
  type: CompetitionType;
}