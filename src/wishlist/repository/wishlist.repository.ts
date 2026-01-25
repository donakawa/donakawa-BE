import {
  AddedItemAuto,
  AddedItemManual,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { AddWishListFromCacheCommand } from "../command/add-wishlist-from-cache.command";
import { AddWishListCommand } from "../command/add-wishlist.command";
import { Row } from "aws-sdk/clients/rdsdataservice";
import { WishitemStatus, WishitemType } from "../types/wishitem.types";
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
  async findAddedItemAutoById<
    T extends Omit<Prisma.AddedItemAutoFindUniqueArgs, "where">,
  >(
    id: string,
    args: Prisma.SelectSubset<
      T,
      Omit<Prisma.AddedItemAutoFindUniqueArgs, "where">
    >,
  ): Promise<Prisma.AddedItemAutoGetPayload<
    { where: { id: bigint } } & T
  > | null>;
  async findAddedItemAutoById(id: string): Promise<AddedItemAuto | null>;

  async findAddedItemAutoById<
    T extends Omit<Prisma.AddedItemAutoFindUniqueArgs, "where">,
  >(
    id: string,
    args?: Prisma.SelectSubset<
      T,
      Omit<Prisma.AddedItemAutoFindUniqueArgs, "where">
    >,
  ) {
    if (!args)
      return this.prisma.addedItemAuto.findUnique({
        where: { id: BigInt(id) },
      });
    return this.prisma.addedItemAuto.findUnique({
      where: { id: BigInt(id) },
      select: args.select,
    });
  }
  async findAddedItemManualById(id: string): Promise<AddedItemManual | null>;
  async findAddedItemManualById<
    T extends Omit<Prisma.AddedItemManualFindUniqueArgs, "where">,
  >(
    id: string,
    args: Prisma.SelectSubset<
      T,
      Omit<Prisma.AddedItemManualFindUniqueArgs, "where">
    >,
  ): Promise<Prisma.AddedItemManualGetPayload<T> | null>;
  async findAddedItemManualById<
    T extends Omit<Prisma.AddedItemManualFindUniqueArgs, "where">,
  >(
    id: string,
    args?: Prisma.SelectSubset<
      T,
      Omit<Prisma.AddedItemManualFindUniqueArgs, "where">
    >,
  ) {
    if (!args)
      return this.prisma.addedItemManual.findUnique({
        where: { id: BigInt(id) },
      });
    return this.prisma.addedItemManual.findUnique({
      where: { id: BigInt(id) },
      select: args.select,
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
  async findAllAddedItem(
    userId: string,
    take: number,
    status?: WishitemStatus,
    cursor?: string,
    folderId?: string,
  ) {
    const conditions: Prisma.Sql[] = [];
    if (cursor) conditions.push(Prisma.sql`cursor < ${cursor}`);
    if (folderId) conditions.push(Prisma.sql`folderId=${BigInt(folderId)}`);
    if (status) conditions.push(Prisma.sql`status=${status}`);
    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
        : Prisma.empty;
    const query = Prisma.sql`select * from (select id, name, price, photo_file_id as "photoFileId", url, created_at as "createdAt", status, folder_id as "folderId", 'MANUAL'::text as type ,concat('M',lpad((extract(epoch from created_at)*1000)::bigint::text,13,'0'),lpad(id::text,13,'0')) as cursor from added_item_manual where user_id = ${userId} union all
SELECT added_item_auto.id, p.name, p.price,p.photo_file_id as "photoFileId", replace(s.product_url_template, '\$\{productId\}', p.product_id) as url,  "createdAt",added_item_auto.status,folder_id, 'AUTO'::text as type,concat('A',lpad((extract(epoch from "createdAt")*1000)::bigint::text,13,'0'),lpad(added_item_auto.id::text,13,'0'))
from added_item_auto left join public.product p on added_item_auto.product_id = p.id
left join store_platform s on p.store_platform_id = s.id where user_id = ${userId}) as t ${whereClause} order by cursor desc limit ${take + 1};`;
    return this.prisma.$queryRaw<Row[]>(query);
  }
}
