import { Prisma, PrismaClient, TargetBudget } from "@prisma/client";
import { GoalsRequestDto } from "../dto/request/goals.request.dto";

type CreateTargetBudgetInput = Omit<GoalsRequestDto, "incomeDate"> & {
  incomeDate: Date | null;
};

export class GoalsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TargetBudget | null> {
    const db = tx ?? this.prisma;
    return db.targetBudget.findFirst({
      where: { userId: BigInt(userId) },
    });
  }

  // 목표 예산 등록
  async createTargetBudget(
    userId: string,
    data: CreateTargetBudgetInput,
    tx?: Prisma.TransactionClient,
  ): Promise<TargetBudget> {
    const db = tx ?? this.prisma;

    return db.targetBudget.create({
      data: {
        userId: BigInt(userId),
        monthlyIncome: data.monthlyIncome,
        incomeDate: data.incomeDate,
        fixedExpense: data.fixedExpense ?? null,
        monthlySaving: data.monthlySaving ?? null,
        spendStrategy: data.spendStrategy,
        shoppingBudget: data.shoppingBudget,
      },
    });
  }

  // 목표 예산 조회
  async findBudgetByUserId(userId: string) {
    return this.prisma.targetBudget.findFirst({
      where: { userId: BigInt(userId) },
    });
  }

  // 목표 예산 수정
  async updateTargetBudget(id: bigint, data: Partial<TargetBudget>) {
    return this.prisma.targetBudget.update({
      where: { id },
      data,
    });
  }
}
