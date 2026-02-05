// histories/service/aicomment.service.ts
import { OpenAI } from "openai";
import { GoalsRepository } from "../../goals/repository/goals.repository";
import { AiCommentResponseDto } from "../dto/response/histories.response.dto";

export class AiCommentService {
  private readonly openai: OpenAI;

  constructor(private readonly goalsRepository: GoalsRepository) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async getAiComment(userId: string): Promise<AiCommentResponseDto> {
    // 이번 달 소비/예산 조회
    const budget = await this.goalsRepository.findBudgetByUserId(userId);
    if (!budget || !budget.incomeDate) {
      throw new Error("User budget not found");
    }

    const nextIncomeDate = budget.incomeDate;
    const cycleStart = new Date(nextIncomeDate);
    cycleStart.setMonth(cycleStart.getMonth() - 1);

    const totalSpend = await this.goalsRepository.getTotalSpendByUser(
      userId,
      cycleStart,
    );

    const shoppingBudget = budget.shoppingBudget ?? 0;
    const savedAmount = Math.max(shoppingBudget - totalSpend, 0);

    // Prompt 생성
    const prompt =
      savedAmount > 0
        ? `이번 달 소비 목표: ${shoppingBudget}원
      이번 달 실제 소비: ${totalSpend}원
      절약한 금액: ${savedAmount}원

      절약한 금액을 반드시 숫자로 포함해서 한 문장으로 후기를 작성해 주세요.
      절약한 금액을 여행, 숙소, 외식 등 구체적인 소비에 비유해서 표현해 주세요.
      말투는 친근하고 뿌듯한 느낌으로 작성해 주세요.`
        : `이번 달 소비 목표: ${shoppingBudget}원
      이번 달 실제 소비: ${totalSpend}원

      소비를 초과했음을 언급하며 한 문장으로 후기를 작성해 주세요.
      조금 아쉬운 느낌의 말투로 작성해 주세요.`;

    // OpenAI 호출
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const comment = completion.choices[0]?.message?.content?.trim() ?? "";

    const type: "positive" | "negative" =
      savedAmount > 0 ? "positive" : "negative";

    return { comment, type };
  }
}
