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

  // 만족 소비, 후회 소비 조회
  async findSpendItems(
    userId: string,
    since: Date,
    isSatisfied: boolean,
    cursor?: string,
    take: number = 10,
  ) {
    const cursorBigInt = cursor ? BigInt(cursor) : undefined;
    const satisfactionCondition = isSatisfied ? { gte: 4 } : { lte: 3 };

    return this.prisma.review.findMany({
      where: {
        satisfaction: satisfactionCondition,
        OR: [
          {
            addedItemAuto: {
              userId: BigInt(userId),
              purchasedHistory: { some: { purchasedDate: { gte: since } } },
            },
          },
          {
            addedItemManual: {
              userId: BigInt(userId),
              purchasedHistory: { some: { purchasedDate: { gte: since } } },
            },
          },
        ],
      },
      include: {
        addedItemAuto: {
          select: {
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                files: { select: { id: true } },
              },
            },
            purchasedHistory: { orderBy: { purchasedDate: "desc" }, take: 1 },
          },
        },
        addedItemManual: {
          select: {
            createdAt: true,
            id: true,
            name: true,
            price: true,
            files: { select: { id: true } },
            purchasedHistory: {
              orderBy: { purchasedDate: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: take + 1,
      cursor: cursorBigInt ? { id: cursorBigInt } : undefined,
    });
  }

  // 만족 소비, 후회 소비 개수
  async countRecentMonth(userId: string, since: Date, isSatisfied: boolean) {
    const satisfactionCondition = isSatisfied ? { gte: 4 } : { lte: 3 };

    return this.prisma.review.count({
      where: {
        satisfaction: satisfactionCondition,
        OR: [
          {
            addedItemAuto: {
              userId: BigInt(userId),
              purchasedHistory: { some: { purchasedDate: { gte: since } } },
            },
          },
          {
            addedItemManual: {
              userId: BigInt(userId),
              purchasedHistory: { some: { purchasedDate: { gte: since } } },
            },
          },
        ],
      },
    });
  }
}
