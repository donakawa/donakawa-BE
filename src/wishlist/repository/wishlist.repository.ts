import {
  AddedItemAuto,
  AddedItemManual,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { AddWishListFromCacheCommand } from "../command/add-wishlist-from-cache.command";
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
        photoFileId: true,
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
    command: AddWishListFromCacheCommand,
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
  async saveAddedItemManual(
    command: AddWishListCommand,
    tx?: Prisma.TransactionClient,
  ): Promise<AddedItemManual> {
    const db = tx ?? this.prisma;
    return await db.addedItemManual.create({
      data: {
        userId: BigInt(command.userId),
        name: command.name,
        price: command.price,
        storePlatform: command.storeName,
        brand: command.brandName,
        reason: command.reason,
        photoFileId: command.photoFileId ? BigInt(command.photoFileId) : null,
        url: command.url,
      },
    });
  }
  async findAddedItemManualByUrl<
    T extends Prisma.AddedItemManualFindUniqueArgs,
  >(
    url: string,
    userId: string,
    args?: Omit<T, "where">,
  ): Promise<AddedItemManual | Prisma.AddedItemManualGetPayload<T> | null> {
    if (!args)
      return this.prisma.addedItemManual.findFirst({
        where: { url: url, userId: BigInt(userId) },
      });
    return this.prisma.addedItemManual.findFirst({
      where: { url: url, userId: BigInt(userId) },
      select: args?.select,
    });
  }
}
