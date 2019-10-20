interface Dossard {
  team: string;
  int: string;
  val: string;
  fonc: string;
  evo: string;
  pres: string;
}

interface JudgeSheet {
  competitionId: string;
  component: string;
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