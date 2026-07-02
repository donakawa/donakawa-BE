export interface TournamentItemSummary {
  id: number;
  slot: number;
  type: "AUTO" | "MANUAL";
  name: string;
  price: number;
  imageUrl: string | null;
}

export interface CreateTournamentResponse {
  id: number;
  createdAt: string;
}

export interface TournamentListResponse {
  id: number;
  title: string;
  totalItems: number;
  isFinished: boolean;
  createdAt: string;
}

export interface TournamentDetailResponse {
  id: number;
  totalItems: number;
  isFinished: boolean;
  currentRound: number;
  totalRounds: number;
  currentMatchIndex: number;
  createdAt: string;
  items: TournamentItemSummary[];
}

export interface TournamentRoundResponse {
  round: number;
  totalRounds: number;
  matchIndex: number;
  matchesInRound: number;
  leftItem: TournamentItemSummary;
  rightItem: TournamentItemSummary;
}

export interface TournamentSelectResponse {
  isFinished: boolean;
}

export interface TournamentResultResponse {
  winner: TournamentItemSummary;
}
