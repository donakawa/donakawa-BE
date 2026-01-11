import { PrismaClient } from "@prisma/client";

export class WishlistRepository {
  constructor(private readonly prisma: PrismaClient) {}
}
