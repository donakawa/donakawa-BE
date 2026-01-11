import { PrismaClient } from "@prisma/client";

export class HistoriesRepository {
  constructor(private readonly prisma: PrismaClient) {}
}
