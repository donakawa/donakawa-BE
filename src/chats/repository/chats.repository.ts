import { PrismaClient } from "@prisma/client";

export class ChatsRepository {
  constructor(private readonly prisma: PrismaClient) {}
}
