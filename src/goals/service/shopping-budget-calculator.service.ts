interface CalculateInput {
  monthlyIncome: number;
  fixedExpense?: number;
  monthlySaving?: number;
  spendStrategy: number;
}

export class ShoppingBudgetCalculator {
  static calculate(input: CalculateInput): number {
    const { monthlySaving } = input;

    // 저축액 입력 여부 체크 후 충족 여부 판단
    if (monthlySaving !== undefined) {
      const isSavingSatisfied = this.checkSaving(input);

      if (isSavingSatisfied) {
        return this.calculateSavingSatisfied(input);
      } else {
        return this.calculateNormal(input);
      }
    }

    // 저축액 입력 없는 경우
    return this.calculateNormal(input);
  }

  // 입력 저축액 충족 여부 판단
  private static checkSaving(input: CalculateInput): boolean {
    const { monthlyIncome, monthlySaving, spendStrategy } = input;
    const saving = monthlySaving!;

    switch (spendStrategy) {
      case 1:
        return saving >= monthlyIncome * 0.5;

      case 2:
        return saving >= monthlyIncome * 0.3;

      case 3:
        return saving >= monthlyIncome * 0.2;

      default:
        return false;
    }
  }

  // 기준 충족한 경우의 온라인 쇼핑 목표액 계산
  private static calculateSavingSatisfied(input: CalculateInput): number {
    const { monthlyIncome, fixedExpense } = input;

    // 고정비 있는 경우
    if (fixedExpense !== undefined) {
      return Math.max(0, Math.floor(monthlyIncome - fixedExpense));
    }

    // 고정비 없는 경우
    return Math.floor(monthlyIncome * 0.375);
  }

  // 입력 저축액 없거나 기준 미달한 경우의 온라인 쇼핑 목표액 계산
  private static calculateNormal(input: CalculateInput): number {
    const { monthlyIncome, fixedExpense, spendStrategy } = input;

    // 고정비 있는 경우
    if (fixedExpense !== undefined) {
      switch (spendStrategy) {
        case 1:
          return Math.max(0, Math.floor(monthlyIncome * 0.5 - fixedExpense));

        case 2:
          return Math.max(0, Math.floor(monthlyIncome * 0.7 - fixedExpense));

        case 3:
          return Math.max(0, Math.floor(monthlyIncome * 0.8 - fixedExpense));

        default:
          return 0;
      }
    }

    // 고정비 없는 경우
    switch (spendStrategy) {
      case 1:
        return Math.floor(monthlyIncome * 0.2);

      case 2:
        return Math.floor(monthlyIncome * 0.3);

      case 3:
        return Math.floor(monthlyIncome * 0.4);

      default:
        return 0;
    }
  }
}
