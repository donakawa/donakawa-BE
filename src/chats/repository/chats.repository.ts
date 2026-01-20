import { PrismaClient } from "@prisma/client";

export class ChatsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  createChat(userId: number, title: string) {
    return this.prisma.aiChatHeader.create({
      data: {
        userId,
        title,
      },
    });
  }

  findChatsByUser(userId: number) {
    return this.prisma.aiChatHeader.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  findChatDetail(chatId: number) {
    return this.prisma.aiChatHeader.findUnique({
      where: { id: BigInt(chatId) },
      include: {
        aiChatMessage: true,
        aiChatSelection: true,
        aiChatResult: true,
      },
    });
  }

  createMessage(headerId: number, sender: "AI" | "USER", content: string) {
    return this.prisma.aiChatMessage.create({
      data: {
        headerId,
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

  async createChatResult(input: {
    headerId: number;
    decision: "BUY" | "HOLD";
  }) {
    return this.prisma.aiChatResult.create({
      data: {
        headerId: BigInt(input.headerId),
        decision: input.decision,
      },
    });
  }
}
