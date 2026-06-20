export type MatchStatus = 'Selesai' | 'Live' | 'Belum Dimainkan';

export interface Match {
  id: string;
  round: 'Fase Grup' | '32 Besar' | '16 Besar' | 'Perempat Final' | 'Semifinal' | 'Final';
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  winner?: string;
  date: string;
  stadium: string;
  flagA: string;
  flagB: string;
  status: MatchStatus;
  group?: string;
}

export interface Round {
  title: string;
  matches: Match[];
}
