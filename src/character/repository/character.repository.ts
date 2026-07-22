import {
  Prisma,
  PrismaClient,
  AddedItemStatus,
  ItemCategory,
} from "@prisma/client";

export class CharacterRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // 햄스터 한마디
  // 일상
  async findUser(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: BigInt(userId),
      },
      select: {
        id: true,
        nickname: true,
        lastLoginAt: true,
        loginGreetingShown: true,
        goalWelcomeShown: true,
        lastGoalMonthlyWelcomeYear: true,
        lastGoalMonthlyWelcomeMonth: true,
      },
    });
  }

  // 예산
  async findBudget(userId: string) {
    return this.prisma.targetBudget.findFirst({
      where: {
        userId: BigInt(userId),
      },
    });
  }

  // 모으기 목표
  async findGoal(userId: string) {
    return this.prisma.goal.findFirst({
      where: {
        userId: BigInt(userId),
      },
    });
  }

  // 구매 포기
  async findLatestSkipPurchase(userId: string) {
    const userIdBigInt = BigInt(userId);

    const [autoItem, manualItem] = await Promise.all([
      this.prisma.addedItemAuto.findFirst({
        where: {
          userId: userIdBigInt,
          status: AddedItemStatus.DROPPED,
        },
        select: {
          updatedAt: true,
          product: {
            select: {
              price: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),

      this.prisma.addedItemManual.findFirst({
        where: {
          userId: userIdBigInt,
          status: AddedItemStatus.DROPPED,
        },
        select: {
          price: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
    ]);

    if (!autoItem && !manualItem) {
      return null;
    }

    if (!manualItem) {
      return {
        price: autoItem!.product.price,
        updatedAt: autoItem!.updatedAt ?? new Date(0),
      };
    }

    if (!autoItem) {
      return {
        price: manualItem.price,
        updatedAt: manualItem.updatedAt ?? new Date(0),
      };
    }

    const autoUpdatedAt = autoItem.updatedAt ?? new Date(0);
    const manualUpdatedAt = manualItem.updatedAt ?? new Date(0);

    return autoUpdatedAt >= manualUpdatedAt
      ? {
          price: autoItem.product.price,
          updatedAt: autoUpdatedAt,
        }
      : {
          price: manualItem.price,
          updatedAt: manualUpdatedAt,
        };
  }

  // 모으기 목표 - 목표 설정
  async updateGoalWelcomeShown(userId: string) {
    return this.prisma.user.update({
      where: {
        id: BigInt(userId),
      },
      data: {
        goalWelcomeShown: true,
      },
    });
  }

  // 모으기 목표 - 갱신일
  async updateGoalMonthlyWelcome(userId: string, year: number, month: number) {
    return this.prisma.user.update({
      where: {
        id: BigInt(userId),
      },
      data: {
        lastGoalMonthlyWelcomeYear: year,
        lastGoalMonthlyWelcomeMonth: month,
      },
    });
  }

  // 일상 - 로그인 갱신
  async updateLastLoginAt(userId: string) {
    await this.prisma.user.update({
      where: {
        id: BigInt(userId),
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async updateLoginGreetingShown(userId: string) {
    return this.prisma.user.update({
      where: {
        id: BigInt(userId),
      },
      data: {
        loginGreetingShown: true,
      },
    });
  }

  // 햄꾸
  async findUserCoin(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: BigInt(userId),
      },
      select: {
        coin: true,
      },
    });
  }

  async findHamster(userId: string) {
    return this.prisma.hamster.findUnique({
      where: {
        userId: BigInt(userId),
      },
      select: {
        skinId: true,
        accessoryId: true,
        wallpaperId: true,
        floorId: true,
      },
    });
  }

  async findShopItems(category: ItemCategory) {
    return this.prisma.shopItem.findMany({
      where: {
        category,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findOwnedItems(userId: string) {
    return this.prisma.userItem.findMany({
      where: {
        userId: BigInt(userId),
      },
      select: {
        itemId: true,
      },
    });
  }
}
