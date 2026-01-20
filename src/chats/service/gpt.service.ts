import OpenAI from "openai";
import { QUESTIONS } from "../constants/questions";

export type DecisionType = "구매 추천" | "구매 보류";

export interface GptFinishResult {
  decision: DecisionType;
  message: string;
}

export class GptService {
  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async finishDecision(input: {
    item: { name: string; price: number };
    user: { budgetLeft: number; daysUntilBudgetReset: number };
    answers: string[];
  }): Promise<GptFinishResult> {
    const qaText = QUESTIONS.map((q, index) => {
      const answer = input.answers[index] ?? "응답 없음";
      return `Q${q.step}. ${q.question}\nA${q.step}. ${answer}`;
    }).join("\n\n");

    /** 구매 여부 판단 */
    const decisionResponse = await this.client.responses.create({
      model: "gpt-4.1-mini",
      input: `
      너는 소비 결정을 도와주는 AI야.

      아래 정보를 종합해서
      "구매 추천" 또는 "구매 보류" 중 하나를 판단해.

      [상품 정보]
      - 가격: ${input.item.price}원

      [예산 정보]
      - 현재 남은 예산: ${input.user.budgetLeft}원
      - 예산 갱신까지 남은 기간: ${input.user.daysUntilBudgetReset}일

      [질문과 답변]
      ${qaText}

      반드시 아래 JSON 형식으로만 답해:
      {
        "decision": "구매 추천 | 구매 보류"
      }
    `,
    });

    const decision = JSON.parse(decisionResponse.output_text)
      .decision as DecisionType;

    /** 설명 문장 생성 */
    const messageResponse = await this.client.responses.create({
      model: "gpt-4.1-mini",
      input: `
      결론은 "${decision}"이야.

      아래 정보만을 근거로,
      한 단락으로 자연스럽게 설명해줘.

      - 현재 남은 예산: ${input.user.budgetLeft}원
      - 상품 가격: ${input.item.price}원
      - 예산 갱신까지 남은 기간: ${input.user.daysUntilBudgetReset}일

      ❗주의사항
      - 질문/답변 내용은 언급하지 마
      - “~라고 답했고” 같은 표현 금지
      - 숫자는 반드시 그대로 사용
      - 설명만 작성하고 결론 문장은 반복하지 마
    `,
    });

    return {
      decision,
      message: messageResponse.output_text,
    };
  }
}
