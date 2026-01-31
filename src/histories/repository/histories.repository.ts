import { Prisma, PrismaClient } from "@prisma/client";
import { ReviewStatus } from "../dto/request/histories.request.dto";

type MyReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    addedItemAuto: {
      include: {
        product: true;
        purchasedHistory: {
          include: {
            purchasedReason: true;
          };
        };
      };
    };
    addedItemManual: {
      include: {
        purchasedHistory: {
          include: {
            purchasedReason: true;
          };
        };
      };
    };
  };
}>;

type HistoryItemWithRelations = Prisma.PurchasedHistoryGetPayload<{
  include: {
    purchasedReason: true;
    addedItemAuto: {
      include: {
        product: true;
        review: true;
      };
    };
    addedItemManual: {
      include: {
        review: true;
      };
    };
  };
}>;

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

  async findMyReviews(userId: bigint): Promise<MyReviewWithRelations[]> {
    return this.prisma.review.findMany({
      where: {
        OR: [{ addedItemAuto: { userId } }, { addedItemManual: { userId } }],
      },
      include: {
        addedItemAuto: {
          include: {
            product: true,
            purchasedHistory: {
              orderBy: { purchasedDate: "desc" },
              take: 1,
              include: {
                purchasedReason: true,
              },
            },
          },
        },
        addedItemManual: {
          include: {
            purchasedHistory: {
              orderBy: { purchasedDate: "desc" },
              take: 1,
              include: {
                purchasedReason: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findMonthlyPurchasedItems(userId: bigint, start: Date, end: Date) {
    return this.prisma.purchasedHistory.findMany({
      where: {
        purchasedDate: {
          gte: start,
          lt: end,
        },
        OR: [
          {
            addedItemAuto: { userId },
          },
          {
            addedItemManual: { userId },
          },
        ],
      },
      include: {
        addedItemAuto: {
          include: {
            product: true,
            review: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
        addedItemManual: {
          include: {
            review: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: {
        purchasedDate: "asc",
      },
    });
  }

  async findDailyPurchasedItems(userId: bigint, start: Date, end: Date) {
    return this.prisma.purchasedHistory.findMany({
      where: {
        purchasedDate: {
          gte: start,
          lt: end,
        },
        OR: [{ addedItemAuto: { userId } }, { addedItemManual: { userId } }],
      },
      include: {
        addedItemAuto: {
          include: {
            product: true,
            review: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        addedItemManual: {
          include: {
            review: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: {
        purchasedDate: "asc",
      },
    });
  }

  async deleteReviewsByItem(params: {
    itemId: string;
    itemType: "AUTO" | "MANUAL";
    tx?: Prisma.TransactionClient;
  }) {
    const db = params.tx ?? this.prisma;
    const where =
      params.itemType === "AUTO"
        ? { autoItemId: BigInt(params.itemId) }
        : { manualItemId: BigInt(params.itemId) };

    return db.review.deleteMany({
      where,
    });
  }

  async findHistoryItems(
    userId: bigint,
    reviewStatus: ReviewStatus,
  ): Promise<HistoryItemWithRelations[]> {
    const reviewCondition =
      reviewStatus === "WRITTEN"
        ? { some: {} }
        : reviewStatus === "NOT_WRITTEN"
          ? { none: {} }
          : undefined;

    return this.prisma.purchasedHistory.findMany({
      where: {
        OR: [
          {
            addedItemAuto: {
              userId,
              ...(reviewCondition && { review: reviewCondition }),
            },
          },
          {
            addedItemManual: {
              userId,
              ...(reviewCondition && { review: reviewCondition }),
            },
          },
        ],
      },
      include: {
        purchasedReason: true,
        addedItemAuto: {
          include: {
            product: true,
            review: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        addedItemManual: {
          include: {
            review: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: {
        purchasedDate: "desc",
      },
    });
  }

  async findRecentMonthHistories(userId: bigint, start: Date, end: Date) {
    return this.prisma.purchasedHistory.findMany({
      where: {
        purchasedDate: {
          gte: start,
          lte: end,
        },
        OR: [{ addedItemAuto: { userId } }, { addedItemManual: { userId } }],
      },
      include: {
        purchasedReason: true,
        addedItemAuto: {
          include: {
            product: true,
            review: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        addedItemManual: {
          include: {
            review: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
  }

  async findAllByUser(userId: bigint) {
    return this.prisma.purchasedHistory.findMany({
      where: {
        OR: [{ addedItemAuto: { userId } }, { addedItemManual: { userId } }],
      },
      select: {
        purchasedAt: true,
        purchasedDate: true,
      },
    });
  }
}
