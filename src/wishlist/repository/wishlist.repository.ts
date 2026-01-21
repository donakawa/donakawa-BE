import { AddedItemAuto, Prisma, PrismaClient } from "@prisma/client";
import { AddWishListCommand } from "../command/add-wishlist.command";
export class WishlistRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async findProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        name: true,
        price: true,
        updatedAt: true,
        productId: true,
        storePlatformId: true,
        storePlatform: {
          select: {
            name: true,
          },
        },
      },
    });
  }
  async findAddedItemAutoById<T extends Prisma.AddedItemAutoFindUniqueArgs>(
    id: string,
    args?: Omit<T, "where">,
  ): Promise<AddedItemAuto | Prisma.AddedItemAutoGetPayload<T> | null> {
    if (!args)
      return this.prisma.addedItemAuto.findUnique({
        where: { id: BigInt(id) },
      });
    return this.prisma.addedItemAuto.findUnique({
      where: { id: BigInt(id) },
      select: args?.select,
    });
  }
  async findAddedItemAutoByProductId<
    T extends Prisma.AddedItemAutoFindUniqueArgs,
  >(
    productId: string,
    args?: Omit<T, "where">,
  ): Promise<AddedItemAuto | Prisma.AddedItemAutoGetPayload<T> | null> {
    if (!args)
      return this.prisma.addedItemAuto.findFirst({
        where: { product: { id: BigInt(productId) } },
      });
    return this.prisma.addedItemAuto.findFirst({
      where: { product: { id: BigInt(productId) } },
      select: args?.select,
    });
  }
  async saveAddedItemAuto(
    command: AddWishListCommand,
    tx?: Prisma.TransactionClient,
  ): Promise<AddedItemAuto> {
    const db = tx ?? this.prisma;
    return await db.addedItemAuto.create({
      data: {
        userId: BigInt(command.userId),
        productId: BigInt(command.cacheId),
      },
    });
  }
}
