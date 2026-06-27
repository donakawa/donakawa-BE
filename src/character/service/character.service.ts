import { CharacterRepository } from "../repository/character.repository";
import { GoalsRepository } from "../../goals/repository/goals.repository";
import { MessageData } from "../types/message.type";
import { HamsterTalkResponseDto } from "../dto/response/character.response.dto";
import { MessagePolicy } from "../policy/message.policy";
import { MessageId } from "../enums/message-id.enum";

export class CharacterService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly goalRepository: GoalsRepository,
  ) {}

  private makeNextCycleDate(incomeDate: Date, originalIncomeDay: number): Date {
    const next = new Date(incomeDate);
    next.setMonth(next.getMonth() + 1);

    const lastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0,
    ).getDate();

    next.setDate(Math.min(originalIncomeDay, lastDay));

    return next;
  }

  // 도나햄 한마디 조회
  async getHamsterTalk(userId: string): Promise<HamsterTalkResponseDto> {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const budget = await this.goalRepository.findBudgetByUserId(userId);

    let totalSpend = 0;

    if (budget) {
      let nextIncomeDate = new Date(budget.incomeDate!);
      nextIncomeDate.setUTCHours(0, 0, 0, 0);

      const originalIncomeDay = budget.incomeDay ?? nextIncomeDate.getUTCDate();

      if (now >= nextIncomeDate) {
        nextIncomeDate = this.makeNextCycleDate(
          nextIncomeDate,
          originalIncomeDay,
        );
        nextIncomeDate.setUTCHours(0, 0, 0, 0);
      }

      const cycleStart = new Date(nextIncomeDate);
      cycleStart.setMonth(cycleStart.getMonth() - 1);
      cycleStart.setUTCHours(-9, 0, 0, 0);

      totalSpend = await this.goalRepository.getTotalSpendByUser(
        userId,
        cycleStart,
      );
    }

    const [user, goal, skippedPurchase] = await Promise.all([
      this.characterRepository.findUser(userId),
      this.characterRepository.findGoal(userId),
      this.characterRepository.findLatestSkipPurchase(userId),
    ]);

    const showGoalWelcome = Boolean(goal && !user?.goalWelcomeShown);
    const showGoalMonthlyWelcome = Boolean(
      goal &&
      budget &&
      now >= budget.incomeDate! &&
      (user?.lastGoalMonthlyWelcomeYear !== currentYear ||
        user?.lastGoalMonthlyWelcomeMonth !== currentMonth),
    );
    const lastLoginAt = user!.lastLoginAt;

    const talkData: MessageData = {
      user,
      goal,
      budget,
      currentSpend: totalSpend,
      skippedPurchase,
      showGoalWelcome,
      showGoalMonthlyWelcome,
      lastLoginAt,
    };

    const talk = MessagePolicy.select(talkData);

    if (talk.id === MessageId.GOAL_01) {
      await this.characterRepository.updateGoalWelcomeShown(userId);
    }

    if (talk.id === MessageId.GOAL_02) {
      await this.characterRepository.updateGoalMonthlyWelcome(
        userId,
        currentYear,
        currentMonth,
      );
    }

    await this.characterRepository.updateLastLoginAt(userId);

    return new HamsterTalkResponseDto({
      conditionId: talk.id,
      message: talk.message,
    });
  }
}
