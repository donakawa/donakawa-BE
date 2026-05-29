import { TargetBudget } from "@prisma/client";

export class GoalsResponseDto {
  readonly id: string;
  readonly monthlyIncome: number;
  readonly incomeDate?: number;
  readonly fixedExpense?: number;
  readonly monthlySaving?: number;
  readonly spendStrategy: number;
  readonly shoppingBudget: number;

  constructor(entity: TargetBudget) {
    this.id = entity.id.toString();
    this.monthlyIncome = entity.monthlyIncome!;
    this.incomeDate = entity.incomeDay ?? 1;
    this.fixedExpense = entity.fixedExpense ?? undefined;
    this.monthlySaving = entity.monthlySaving ?? undefined;
    this.spendStrategy = entity.spendStrategy!;
    this.shoppingBudget = entity.shoppingBudget!;
  }
}

export class BudgetSpendResponseDto {
  totalSpend!: number;
  remainingBudget!: number;

  constructor(data: { totalSpend: number; remainingBudget: number }) {
    this.totalSpend = data.totalSpend;
    this.remainingBudget = data.remainingBudget;
  }
}

export class CalcShoppingBudgetResponseDto {
  shoppingBudget!: number;

  constructor(shoppingBudget: number) {
    this.shoppingBudget = shoppingBudget;
  }
}
