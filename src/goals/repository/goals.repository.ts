import { PrismaClient } from "@prisma/client";

export class GoalsRepository {
  constructor(private readonly prisma: PrismaClient) {}
}
