import { PrismaClient } from "@prisma/client";

export class ChatsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  createChat(userId: number, title: string, addedItemAutoId: number) {
    return this.prisma.aiChatHeader.create({
      data: {
        userId: BigInt(userId),
        title,
        addedItemAutoId: BigInt(addedItemAutoId),
      },
    });
  }

  findChatsByUser(userId: number) {
    return this.prisma.aiChatHeader.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { createdAt: "desc" },
    });
  }

  findAddedItem(addedItemAutoId: number) {
    return this.prisma.addedItemAuto.findUnique({
      where: { id: BigInt(addedItemAutoId) },
      include: {
        product: true,
      },
    });
  }

  findChatDetail(chatId: number) {
    return this.prisma.aiChatHeader.findUnique({
      where: { id: BigInt(chatId) },
      include: {
        user: {
          include: {
            targetBudget: true,
          },
        },
        addedItemAuto: {
          include: {
            product: true,
          },
        },
        aiChatMessage: {
          orderBy: { createdAt: "asc" },
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
    return this.prisma.aiChatResult.create({
      data: {
        headerId: BigInt(input.headerId),
        decision: input.decision,
      },
    });
  }
}
