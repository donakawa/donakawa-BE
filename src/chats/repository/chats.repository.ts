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
        aiChatMessage: {
          include: {
            aiChatSelection: true,
          },
        },
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

  createSelection(messageId: number, content: string) {
    return this.prisma.aiChatSelection.create({
      data: {
        messageId,
        content,
      },
    });
  }

  softDeleteChat(chatId: number) {
    return this.prisma.aiChatHeader.update({
      where: { id: BigInt(chatId) },
      data: {
        title: "[DELETED]",
      },
    });
  }
}
