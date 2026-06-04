export interface CreateTournamentRequest {
  items: { type: "AUTO" | "MANUAL"; id: number }[];
}

export interface SelectTournamentRequest {
  selectedItemId: number;
}
