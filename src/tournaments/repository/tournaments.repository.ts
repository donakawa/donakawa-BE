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

  createSelection(input: {
    tournamentId: number;
    round: number;
    matchIndex: number;
    selectedItemId: bigint;
  }) {
    return this.prisma.tournamentSelection.create({
      data: {
        tournamentId: BigInt(input.tournamentId),
        round: input.round,
        matchIndex: input.matchIndex,
        selectedItemId: input.selectedItemId,
      },
    });
  }

  finishTournament(id: number) {
    return this.prisma.tournament.update({
      where: { id: BigInt(id) },
      data: { isFinished: true },
    });
  }

  deleteTournament(id: number) {
    return this.prisma.tournament.delete({
      where: { id: BigInt(id) },
    });
  }
}
