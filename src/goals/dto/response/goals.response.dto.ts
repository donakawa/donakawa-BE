import { TargetBudget } from "@prisma/client";

export class GoalsResponseDto {
  readonly id: string;
  readonly monthlyIncome: number;
  readonly incomeDate?: number;
  readonly fixedExpense?: number;
  readonly monthlySaving?: number;
  readonly recommendSaving?: number;
  readonly spendStrategy: number;
  readonly shoppingBudget?: number;

  constructor(entity: TargetBudget) {
    this.id = entity.id.toString();
    this.monthlyIncome = entity.monthlyIncome!;
    this.incomeDate = entity.incomeDate
      ? entity.incomeDate.getDate()
      : undefined;
    this.fixedExpense = entity.fixedExpense ?? undefined;
    this.monthlySaving = entity.monthlySaving ?? undefined;
    this.recommendSaving = entity.recommendSaving ?? undefined;
    this.spendStrategy = entity.spendStrategy!;
    this.shoppingBudget = entity.shoppingBudget ?? undefined;
  }
}
