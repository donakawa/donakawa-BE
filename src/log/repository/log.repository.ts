import { Prisma, PrismaClient } from "@prisma/client";
import { AddedItemStatus, GoalStatus } from "@prisma/client";

export class LogRepository {
    constructor(private readonly prisma: PrismaClient) { }
    public async findUser(userId: string) {
        return this.prisma.user.findUnique({
            where: {
                id: BigInt(userId),
            },
            select: {
                id: true,
                createdAt: true,
            },
        });
    }

    public async findInProgressGoal(userId: string) {
        const userIdBigInt = BigInt(userId);
        return this.prisma.goal.findFirst({
            where: {
                userId: userIdBigInt,
                status: GoalStatus.IN_PROGRESS,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    public async getDroppedAutoItems(userId: string) {
        const userIdBigInt = BigInt(userId);
        return this.prisma.addedItemAuto.findMany({
            where: {
                userId: userIdBigInt,
                status: AddedItemStatus.DROPPED,
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                product: {
                    select: {
                        price: true,
                    },
                },
            },
        });
    }

    public async getDroppedManualItems(userId: string) {
        const userIdBigInt = BigInt(userId);
        return this.prisma.addedItemManual.findMany({
            where: {
                userId: userIdBigInt,
                status: AddedItemStatus.DROPPED,
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                price: true,
            },
        });
    }

    public async getDroppedAutoItemsLast3Months(
        userId: string,
        startDate: Date,
    ) {
        const userIdBigInt = BigInt(userId);
        return this.prisma.addedItemAuto.findMany({
            where: {
                userId: userIdBigInt,
                status: AddedItemStatus.DROPPED,
                updatedAt: {
                    gte: startDate,
                },
            },
            select: {
                id: true,
                product: {
                    select: {
                        price: true,
                    },
                },
            },
        });
    }

    public async getDroppedManualItemsLast3Months(
        userId: string,
        startDate: Date,
    ) {
        const userIdBigInt = BigInt(userId);
        return this.prisma.addedItemManual.findMany({
            where: {
                userId: userIdBigInt,
                status: AddedItemStatus.DROPPED,
                updatedAt: {
                    gte: startDate,
                },
            },
            select: {
                id: true,
                price: true,
            },
        });
    }

    public async getWishlistedDates(userId: string) {
        const userIdBigInt = BigInt(userId);
        const [autoItems, manualItems] = await Promise.all([
            this.prisma.addedItemAuto.findMany({
                where: {
                    userId: userIdBigInt,
                },
                select: {
                    createdAt: true,
                },
            }),

            this.prisma.addedItemManual.findMany({
                where: {
                    userId: userIdBigInt,
                },
                select: {
                    createdAt: true,
                },
            }),
        ]);

        return {
            autoItems,
            manualItems,
        };
    }

    public async getBoughtDates(userId: string) {
        const userIdBigInt = BigInt(userId);
        const histories = await this.prisma.purchasedHistory.findMany({
            where: {
                OR: [
                    {
                        addedItemAuto: {
                            userId: userIdBigInt,
                        },
                    },
                    {
                        addedItemManual: {
                            userId: userIdBigInt,
                        },
                    },
                ],
            },
            select: {
                purchasedDate: true,
            },
        });

        return histories;
    }

    public async getDroppedDates(userId: string) {
        const userIdBigInt = BigInt(userId);
        const [autoItems, manualItems] = await Promise.all([
            this.prisma.addedItemAuto.findMany({
                where: {
                    userId: userIdBigInt,
                    status: AddedItemStatus.DROPPED,
                },
                select: {
                    updatedAt: true,
                },
            }),

            this.prisma.addedItemManual.findMany({
                where: {
                    userId: userIdBigInt,
                    status: AddedItemStatus.DROPPED,
                },
                select: {
                    updatedAt: true,
                },
            }),
        ]);

        return {
            autoItems,
            manualItems,
        };
    }

    public async getItemStatusCounts(userId: string) {
        const userIdBigInt = BigInt(userId);
        const [
            autoWishlisted,
            autoBought,
            autoDropped,

            manualWishlisted,
            manualBought,
            manualDropped,
        ] = await Promise.all([
            this.prisma.addedItemAuto.count({
                where: {
                    userId: userIdBigInt,
                },
            }),

            this.prisma.addedItemAuto.count({
                where: {
                    userId: userIdBigInt,
                    status: AddedItemStatus.BOUGHT,
                },
            }),

            this.prisma.addedItemAuto.count({
                where: {
                    userId: userIdBigInt,
                    status: AddedItemStatus.DROPPED,
                },
            }),

            this.prisma.addedItemManual.count({
                where: {
                    userId: userIdBigInt,
                },
            }),

            this.prisma.addedItemManual.count({
                where: {
                    userId: userIdBigInt,
                    status: AddedItemStatus.BOUGHT,
                },
            }),

            this.prisma.addedItemManual.count({
                where: {
                    userId: userIdBigInt,
                    status: AddedItemStatus.DROPPED,
                },
            }),
        ]);

        return {
            total:
                autoWishlisted +
                manualWishlisted,

            bought:
                autoBought +
                manualBought,

            dropped:
                autoDropped +
                manualDropped,
        };
    }

    public async createGoal(params: {
        userId: string;
        title: string;
        moneyGoal: number;
        current: number;
        status: GoalStatus;
        endedAt: Date | null;
    }) {
        const userIdBigInt = BigInt(params.userId);

        return this.prisma.goal.create({
            data: {
                userId: userIdBigInt,
                title: params.title,
                moneyGoal: BigInt(params.moneyGoal),
                current: BigInt(params.current),
                status: params.status,
                endedAt: params.endedAt,
            },
        });
    }

    public async findGoalById(goalId: number) {
        return this.prisma.goal.findUnique({
            where: {
                id: goalId,
            },
        });
    }

    public async updateGoalStatus(
        goalId: number,
        status: GoalStatus,
    ) {
        return this.prisma.goal.update({
            where: {
                id: goalId,
            },
            data: {
                status,
                endedAt: new Date(),
            },
        });
    }

    public async findPastGoals(
        userId: string,
    ) {
        const userIdBigInt = BigInt(userId);

        return this.prisma.goal.findMany({
            where: {
                userId: userIdBigInt,
                status: {
                    in: [
                        GoalStatus.COMPLETED,
                        GoalStatus.STOPPED,
                    ],
                },
            },
            orderBy: {
                endedAt: "desc",
            },
        });
    }

    public async findBoughtItemsByMonth(
        userId: string,
        startDate: Date,
        endDate: Date,
    ) {
        const userIdBigInt = BigInt(userId);

        return this.prisma.purchasedHistory.findMany({
            where: {
                purchasedDate: {
                    gte: startDate,
                    lt: endDate,
                },
                OR: [
                    {
                        addedItemAuto: {
                            userId: userIdBigInt,
                        },
                    },
                    {
                        addedItemManual: {
                            userId: userIdBigInt,
                        },
                    },
                ],
            },
            include: {
                addedItemAuto: {
                    include: {
                        product: {
                            include: {
                                storePlatform: true,
                            },
                        },
                    },
                },
                addedItemManual: true,
            },
        });
    }

    public async findDroppedAutoItemsByMonth(
        userId: string,
        startDate: Date,
        endDate: Date,
    ) {
        const userIdBigInt = BigInt(userId);

        return this.prisma.addedItemAuto.findMany({
            where: {
                userId: userIdBigInt,
                status: AddedItemStatus.DROPPED,
                updatedAt: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: {
                product: {
                    include: {
                        storePlatform: true,
                    },
                },
            },
        });
    }

    public async findDroppedManualItemsByMonth(
        userId: string,
        startDate: Date,
        endDate: Date,
    ) {
        const userIdBigInt = BigInt(userId);

        return this.prisma.addedItemManual.findMany({
            where: {
                userId: userIdBigInt,
                status: AddedItemStatus.DROPPED,
                updatedAt: {
                    gte: startDate,
                    lt: endDate,
                },
            },
        });
    }
}