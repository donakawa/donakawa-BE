import { Prisma, PrismaClient, TargetBudget } from "@prisma/client";
import { GoalsRequestDto } from "../dto/request/goals.request.dto";

type CreateTargetBudgetInput = Omit<GoalsRequestDto, "incomeDate"> & {
  incomeDate: Date | null;
  incomeDay?: number;
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
        incomeDay: data.incomeDay,
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
      data: {
        ...data,
        incomeDay: data.incomeDay ?? undefined,
      },
    });
  }

  // 총 소비 금액 조회
  async getTotalSpendByUser(userId: string, since: Date): Promise<number> {
    const userIdBigInt = BigInt(userId);

    const histories = await this.prisma.purchasedHistory.findMany({
      where: {
        purchasedDate: { gte: since },
        OR: [
          { addedItemAuto: { userId: userIdBigInt } },
          { addedItemManual: { userId: userIdBigInt } },
        ],
      },
      include: {
        addedItemAuto: { select: { product: { select: { price: true } } } },
        addedItemManual: { select: { price: true } },
      },
    });

    return histories.reduce((sum, h) => {
      if (h.addedItemAuto) return sum + h.addedItemAuto.product.price;
      if (h.addedItemManual) return sum + h.addedItemManual.price;
      return sum;
    }, 0);
  }
}
