interface GptDecisionInput {
  item: {
    name: string;
    price: number;
  };
  user: {
    budgetLeft: number;
    daysUntilBudgetReset: number;
  };
  answers: string[];
}

interface GptDecisionResult {
  decision: "구매 추천" | "구매 보류";
  message: string;
}

export class GptService {
  async getDecision(input: GptDecisionInput): Promise<GptDecisionResult> {
    // 나중에 OpenAI API로 교체
    const canAfford = input.user.budgetLeft >= input.item.price;

    if (canAfford) {
      return {
        decision: "구매 추천",
        message: `현재 예산 내에서 구매 가능하며, 선택하신 답변을 보면 만족도가 높을 것으로 보입니다.`,
      };
    }

    return {
      decision: "구매 보류",
      message: `현재 만족도는 높을 수 있으나, 남은 예산이 부족해 이번 달 구매는 부담이 될 수 있습니다.`,
    };
  }
}
