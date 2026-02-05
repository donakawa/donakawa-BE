export interface CreateChatRequest {
  wishItemId: number;
  type: "AUTO" | "MANUAL";
}

export interface SelectOptionRequest {
  step: number;
  selectedOptionId: number;
}
