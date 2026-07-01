export interface CreateChatResponse {
  id: number;
  currentStep: number;
  createdAt: string;
}

export interface ChatListResponse {
  id: number;
  title: string;
  createdAt: string;
}

export interface ChatDetailResponse {
  id: number;
  wishItem: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
  };
  answers: {
    step: number;
    selectedOption: string;
  }[];
  result: string | null;
  currentStep: number;
}

// 구매 추천 + 예산 충분
// 구매 추천 + 예산 부족 (아이템 가격 > 남은 예산)
// 구매 보류 + 예산 충분
// 구매 보류 + 예산 부족
export type ResultType =
  | "RECOMMEND_AFFORDABLE"
  | "RECOMMEND_OVER_BUDGET"
  | "HOLD_AFFORDABLE"
  | "HOLD_OVER_BUDGET";

export interface ResultResponse {
  resultType: ResultType;
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
