export interface CreateChatResponse {
  id: number;
  currentStep: number;
  createdAt: string;
}

export interface ChatListResponse {
  id: number;
  wishItemName: string;
  status: "IN_PROGRESS" | "FINISHED" | "DELETED";
  createdAt: string;
}

export interface ChatDetailResponse {
  id: number;
  wishItem: {
    id: number;
    name: string;
    price: number;
  };
  answers: {
    step: number;
    selectedOption: string;
  }[];
  result: string | null;
  currentStep: number;
}

export interface GptResultResponse {
  decision: "구매 추천" | "구매 보류";
  message: string;
}

export interface QuestionResponse {
  step: number;
  question: string;
  options: readonly {
    id: number;
    label: string;
  }[];
}

export interface FinishResponse {
  isFinished: boolean;
}

export interface DeleteResponse {
  message: string;
}
