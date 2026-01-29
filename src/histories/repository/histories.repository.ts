import { PrismaClient } from "@prisma/client";

export class HistoriesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAutoItem(itemId: number, userId: bigint) {
    return this.prisma.addedItemAuto.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });
  }

  async findManualItem(itemId: number, userId: bigint) {
    return this.prisma.addedItemManual.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });
  }

  async createReview(params: {
    autoItemId?: number;
    manualItemId?: number;
    satisfaction: number;
    frequency: number;
  }) {
    return this.prisma.review.create({
      data: {
        autoItemId: params.autoItemId,
        manualItemId: params.manualItemId,
        satisfaction: params.satisfaction,
        frequency: params.frequency,
      },
    });
  }

  async findMyReviews(userId: bigint) {
    return this.prisma.review.findMany({
      where: {
        OR: [
          {
            addedItemAuto: {
              userId,
            },
          },
          {
            addedItemManual: {
              userId,
            },
          },
        ],
      },
      include: {
        addedItemAuto: {
          include: {
            product: true,
            purchasedHistory: { orderBy: { purchasedDate: "desc" }, take: 1 },
          },
        },
        addedItemManual: {
          include: {
            purchasedHistory: { orderBy: { purchasedDate: "desc" }, take: 1 },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}