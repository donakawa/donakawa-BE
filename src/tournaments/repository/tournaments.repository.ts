import { PrismaClient } from "@prisma/client";

export class TournamentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  createTournament(input: {
    userId: number;
    title: string;
    totalItems: number;
    items: { itemType: "AUTO" | "MANUAL"; itemId: number; slot: number }[];
  }) {
    return this.prisma.tournament.create({
      data: {
        userId: BigInt(input.userId),
        title: input.title,
        totalItems: input.totalItems,
        items: {
          create: input.items.map((item) => ({
            itemType: item.itemType,
            slot: item.slot,
            ...(item.itemType === "AUTO"
              ? { autoItemId: BigInt(item.itemId) }
              : { manualItemId: BigInt(item.itemId) }),
          })),
        },
      },
    });
  }

  async countOwnedItems(
    userId: number,
    autoIds: number[],
    manualIds: number[],
  ): Promise<{ autoCount: number; manualCount: number }> {
    const [autoCount, manualCount] = await Promise.all([
      autoIds.length > 0
        ? this.prisma.addedItemAuto.count({
            where: { id: { in: autoIds.map(BigInt) }, userId: BigInt(userId) },
          })
        : Promise.resolve(0),
      manualIds.length > 0
        ? this.prisma.addedItemManual.count({
            where: { id: { in: manualIds.map(BigInt) }, userId: BigInt(userId) },
          })
        : Promise.resolve(0),
    ]);
    return { autoCount, manualCount };
  }

  findTournamentsByUser(userId: number) {
    return this.prisma.tournament.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { createdAt: "desc" },
    });
  }

  findTournamentDetail(id: number) {
    return this.prisma.tournament.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: {
          include: {
            autoItem: { include: { product: true } },
            manualItem: true,
          },
        },
        selections: {
          orderBy: [{ round: "asc" }, { matchIndex: "asc" }],
        },
      },
    });
  }

  saveSelectionTx(input: {
    tournamentId: number;
    round: number;
    matchIndex: number;
    selectedItemId: bigint;
    finish: boolean;
  }) {
    return this.prisma.$transaction([
      this.prisma.tournamentSelection.create({
        data: {
          tournamentId: BigInt(input.tournamentId),
          round: input.round,
          matchIndex: input.matchIndex,
          selectedItemId: input.selectedItemId,
        },
      }),
      ...(input.finish
        ? [
            this.prisma.tournament.update({
              where: { id: BigInt(input.tournamentId) },
              data: { isFinished: true },
            }),
          ]
        : []),
    ]);
  }

  deleteTournament(id: number) {
    return this.prisma.tournament.delete({
      where: { id: BigInt(id) },
    });
  }
}
