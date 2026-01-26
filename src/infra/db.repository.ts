import { Prisma, PrismaClient } from "@prisma/client";

export class DbRepository {
  constructor(private readonly prisma: PrismaClient) {}
  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }
}
