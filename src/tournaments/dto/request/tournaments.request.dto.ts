export interface CreateTournamentRequest {
  /** @default "My Tournament" */
  title: string;
  /** @default [{"type":"MANUAL","id":1},{"type":"MANUAL","id":2}] */
  items: { type: "AUTO" | "MANUAL"; id: number }[];
}

export interface SelectTournamentRequest {
  selectedItemId: number;
}
