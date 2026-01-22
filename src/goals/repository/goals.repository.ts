import { Prisma, PrismaClient, TargetBudget } from "@prisma/client";
import { GoalsRequestDto } from "../dto/request/goals.request.dto";

type CreateTargetBudgetInput = Omit<GoalsRequestDto, "incomeDate"> & {
  incomeDate: Date | null;
};

export class GoalsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(
    userId: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<TargetBudget | null> {
    const db = tx ?? this.prisma;
    return db.targetBudget.findFirst({ where: { userId } });
  }

  // 목표 예산 등록
  async createTargetBudget(
    userId: bigint,
    data: CreateTargetBudgetInput,
    tx?: Prisma.TransactionClient,
  ): Promise<TargetBudget> {
    const db = tx ?? this.prisma;

    return db.targetBudget.create({
      data: {
        userId,
        monthlyIncome: data.monthlyIncome,
        incomeDate: data.incomeDate,
        fixedExpense: data.fixedExpense ?? null,
        monthlySaving: data.monthlySaving ?? null,
        recommendSaving: data.recommendSaving ?? null,
        spendStrategy: data.spendStrategy,
        shoppingBudget: data.shoppingBudget ?? null,
      },
    });
  }

  // 목표 예산 조회
  async findBudgetByUserId(userId: bigint) {
    return this.prisma.targetBudget.findFirst({
      where: { userId },
    });
  }
}
