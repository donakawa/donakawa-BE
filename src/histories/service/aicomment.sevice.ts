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
절약 금액: ${savedAmount}원

한 줄로 후기를 작성하고, 긍정적인 느낌으로 작성해 주세요.`
        : `이번 달 소비 목표: ${shoppingBudget}원
이번 달 실제 소비: ${totalSpend}원

한 줄로 후기를 작성하고, 부정적인 느낌으로 작성해 주세요.`;

    // OpenAI 호출
    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const comment = completion.choices[0]?.message?.content?.trim() ?? "";

    const type: "positive" | "negative" =
      savedAmount > 0 ? "positive" : "negative";

    return { comment, type };
  }
}
