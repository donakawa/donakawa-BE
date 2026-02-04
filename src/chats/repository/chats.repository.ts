import { PrismaClient } from "@prisma/client";

export type WishItemSummary = {
  id: number;
  name: string;
  price: number;
};

export class ChatsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  createChat(input: {
    userId: number;
    itemType: "AUTO" | "MANUAL";
    itemId: number;
    title: string;
  }) {
    return this.prisma.aiChatHeader.create({
      data: {
        title: input.title,
        itemType: input.itemType,

        user: {
          connect: { id: BigInt(input.userId) },
        },

        ...(input.itemType === "AUTO"
          ? { autoItem: { connect: { id: BigInt(input.itemId) } } }
          : { manualItem: { connect: { id: BigInt(input.itemId) } } }),
      },
    });
  }

  async findChatItem(
    type: "AUTO" | "MANUAL",
    wishItemId: number,
  ): Promise<WishItemSummary | null> {
    if (type === "AUTO") {
      const item = await this.prisma.addedItemAuto.findUnique({
        where: { id: BigInt(wishItemId) },
        include: { product: true },
      });

      if (!item) return null;

      return {
        id: Number(item.id),
        name: item.product.name,
        price: item.product.price,
      };
    }

    const item = await this.prisma.addedItemManual.findUnique({
      where: { id: BigInt(wishItemId) },
    });

    if (!item) return null;

    return {
      id: Number(item.id),
      name: item.name,
      price: item.price,
    };
  }

  findChatsByUser(userId: number) {
    return this.prisma.aiChatHeader.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { createdAt: "desc" },
    });
  }

  findAddedItemAuto(id: number) {
    return this.prisma.addedItemAuto.findUnique({
      where: { id: BigInt(id) },
      include: { product: true },
    });
  }

  findAddedItemManual(id: number) {
    return this.prisma.addedItemManual.findUnique({
      where: { id: BigInt(id) },
    });
  }

  findChatDetail(chatId: number) {
    return this.prisma.aiChatHeader.findUnique({
      where: { id: BigInt(chatId) },
      include: {
        user: { include: { targetBudget: true } },
        autoItem: {
          include: { product: true },
        },
        manualItem: true,
        aiChatMessage: {
          orderBy: { createdAt: "asc" },
        },
        aiChatSelection: {
          orderBy: { step: "asc" },
        },
        aiChatResult: true,
      },
    });
  }

  createMessage(headerId: number, sender: "AI" | "USER", content: string) {
    return this.prisma.aiChatMessage.create({
      data: {
        headerId: BigInt(headerId),
        sender,
        content,
      },
    });
  }

  createSelection(input: { headerId: number; step: number; content: string }) {
    return this.prisma.aiChatSelection.create({
      data: {
        headerId: BigInt(input.headerId),
        step: input.step,
        content: input.content,
      },
    });
  }

  deleteChat(chatId: number) {
    return this.prisma.aiChatHeader.delete({
      where: { id: BigInt(chatId) },
    });
  }

  createChatResult(input: { headerId: number; decision: string }) {
    return this.prisma.aiChatResult.upsert({
      where: { headerId: BigInt(input.headerId) },
      update: { decision: input.decision },
      create: {
        headerId: BigInt(input.headerId),
        decision: input.decision,
      },
    });
  }
}
