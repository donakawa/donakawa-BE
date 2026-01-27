import { GoalsRepository } from "../repository/goals.repository";
import {
  GoalsRequestDto,
  GoalsUpdateRequestDto,
  CalcShoppingBudgetRequestDto,
} from "../dto/request/goals.request.dto";
import {
  GoalsResponseDto,
  BudgetSpendResponseDto,
  CalcShoppingBudgetResponseDto,
} from "../dto/response/goals.response.dto";
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "../../errors/error";
import { ShoppingBudgetCalculator } from "../domain/shopping-budget.calculator";

export class GoalsService {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  // 갱신일 등록 계산
  private makeNextIncomeDate(day: number): Date {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    const today = now.getDate();

    if (day <= today) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const targetDay = Math.min(day, lastDayOfMonth);

    return new Date(year, month, targetDay, 0, 0, 0);
  }

  // 갱신일 업데이트
  private makeNextCycleDate(
    currentNext: Date,
    originalIncomeDay: number,
  ): Date {
    const year = currentNext.getFullYear();
    const month = currentNext.getMonth() + 1;
    const day = originalIncomeDay;

    const lastDayOfNextMonth = new Date(year, month + 1, 0).getDate();
    const targetDay = Math.min(day, lastDayOfNextMonth);

    return new Date(year, month, targetDay, 0, 0, 0);
  }

  // 날짜 범위 검증
  private validateIncomeDate(day: number) {
    if (day < 1 || day > 31) {
      throw new BadRequestException(
        "B002",
        "incomeDate는 1에서 31 사이의 값이어야 합니다.",
      );
    }
  }

  // 목표 예산 등록
  async createTargetBudget(
    userId: string,
    body: GoalsRequestDto,
  ): Promise<GoalsResponseDto> {
    const isExist = await this.goalsRepository.findByUserId(userId);
    if (isExist) {
      throw new ConflictException(
        "B001",
        "이미 목표 예산이 등록되어 있습니다.",
      );
    }

    const incomeDay = body.incomeDate ?? 1;
    this.validateIncomeDate(incomeDay);
    const { incomeDate: _, ...rest } = body;
    const nextIncomeDate = this.makeNextIncomeDate(incomeDay);

    const saved = await this.goalsRepository.createTargetBudget(userId, {
      ...rest,
      incomeDate: nextIncomeDate,
      incomeDay,
    });

    return new GoalsResponseDto(saved);
  }

  // 목표 예산 조회
  async getTargetBudget(userId: string): Promise<GoalsResponseDto> {
    const result = await this.goalsRepository.findBudgetByUserId(userId);
    if (!result) {
      throw new NotFoundException("B003", "등록된 목표 예산이 없습니다.");
    }

    return new GoalsResponseDto(result);
  }

  // 목표 예산 수정
  async updateTargetBudget(
    userId: string,
    body: GoalsUpdateRequestDto,
  ): Promise<GoalsResponseDto> {
    const isExist = await this.goalsRepository.findBudgetByUserId(userId);
    if (!isExist) {
      throw new NotFoundException("B003", "등록된 목표 예산이 없습니다.");
    }

    let nextIncomeDate = isExist.incomeDate;
    let incomeDay = isExist.incomeDay;

    if (body.incomeDate !== undefined) {
      this.validateIncomeDate(body.incomeDate);
      incomeDay = body.incomeDate;
      nextIncomeDate = this.makeNextIncomeDate(body.incomeDate);
    }

    const updated = await this.goalsRepository.updateTargetBudget(isExist.id, {
      ...body,
      incomeDate: nextIncomeDate,
      incomeDay,
    });

    return new GoalsResponseDto(updated);
  }

  // 소비, 남은 예산 값 조회 (갱신일 자동 적용)
  async getBudgetSpend(userId: string) {
    const budget = await this.goalsRepository.findBudgetByUserId(userId);
    if (!budget) {
      throw new NotFoundException("B003", "등록된 목표 예산이 없습니다.");
    }

    const now = new Date();
    let nextIncomeDate = budget.incomeDate!;
    const originalIncomeDay = budget.incomeDay ?? nextIncomeDate.getDate();

    if (now >= nextIncomeDate) {
      nextIncomeDate = this.makeNextCycleDate(
        nextIncomeDate,
        originalIncomeDay,
      );

      await this.goalsRepository.updateTargetBudget(budget.id, {
        incomeDate: nextIncomeDate,
      });
    }

    const cycleStart = new Date(nextIncomeDate);
    cycleStart.setMonth(cycleStart.getMonth() - 1);

    const totalSpend = await this.goalsRepository.getTotalSpendByUser(
      userId,
      cycleStart,
    );

    const resetSpend = now >= budget.incomeDate! ? 0 : totalSpend;
    const shoppingBudget = budget.shoppingBudget ?? 0;
    const remainingBudget = shoppingBudget - resetSpend;

    return new BudgetSpendResponseDto({
      totalSpend: resetSpend,
      remainingBudget,
    });
  }

  // 온라인 쇼핑 목표액 계산
  async calcShoppingBudget(
    body: CalcShoppingBudgetRequestDto,
  ): Promise<CalcShoppingBudgetResponseDto> {
    const shoppingBudget = ShoppingBudgetCalculator.calculate({
      monthlyIncome: body.monthlyIncome,
      fixedExpense: body.fixedExpense,
      monthlySaving: body.monthlySaving,
      spendStrategy: body.spendStrategy,
    });

    return new CalcShoppingBudgetResponseDto(shoppingBudget);
  }
}
