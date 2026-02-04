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

    //  구매 여부 판단
    const decisionResponse = (await this.client.responses.create({
      model: "gpt-4.1-mini",
      input: `
        너는 소비 결정을 도와주는 AI야.

        [상품 정보]
        - 가격: ${input.item.price}원

        [예산 정보]
        - 현재 남은 예산: ${input.user.budgetLeft}원
        - 예산 갱신까지 남은 기간: ${input.user.daysUntilBudgetReset}일

        [질문과 답변]
        ${qaText}
      `,
      text: {
        format: {
          type: "json_schema",
          name: "decision_response",
          strict: false,
          schema: {
            type: "object",
            properties: {
              decision: {
                type: "string",
                enum: ["구매 추천", "구매 보류"],
              },
            },
            required: ["decision"],
            additionalProperties: false,
          },
        },
      },
    } as any)) as any;

    const decision = decisionResponse.output_parsed?.decision as DecisionType;

    if (!decision) {
      throw new Error("GPT decision missing");
    }

    // 설명 문장 생성
    const messageResponse = await this.client.responses.create({
      model: "gpt-4.1-mini",
      input: `
        결론은 "${decision}"이야.

        아래 정보만을 근거로,
        한 단락으로 자연스럽게 설명해줘.

        - 현재 남은 예산: ${input.user.budgetLeft}원
        - 상품 가격: ${input.item.price}원
        - 예산 갱신까지 남은 기간: ${input.user.daysUntilBudgetReset}일
      `,
    });

    return {
      decision,
      message: messageResponse.output_text.trim(),
    };
  }
}
