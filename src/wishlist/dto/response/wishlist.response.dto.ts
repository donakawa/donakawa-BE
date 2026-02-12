import {
  AddedItemAuto,
  AddedItemManual,
  Product,
  StorePlatform,
  WishItemFolder,
} from "@prisma/client";
import {
  WishItemFolderPayload,
  WishItemPayload,
  WishItemPreviewPayload,
} from "../../payload/wishlist.payload";
import { WishlistRecordInterface } from "../../interface/wishlist.interface";

export class AddCrawlTaskResponseDto {
  jobId!: string;
  requestedAt!: string;
  constructor(jobId: string, requestedAt: string) {
    this.jobId = jobId;
    this.requestedAt = requestedAt;
  }
}

export class GetCrawlResultResponseDto {
  id!: string;
  productName!: string;
  brandName!: string | null;
  platformName!: string;
  productId!: string;
  price!: number;
  updatedAt!: string;
  imageUrl!: string | undefined;
  constructor(
    entity: Product,
    storePlatformName: string,
    imageUrl: string | undefined,
  ) {
    this.id = entity.id.toString();
    this.productName = entity.name;
    this.brandName = entity.brandName;
    this.platformName = storePlatformName;
    this.productId = entity.productId;
    this.price = entity.price;
    this.updatedAt =
      entity.updatedAt?.toISOString() ?? new Date().toISOString();
    this.imageUrl = imageUrl;
  }
}
export class AddWishListFromCacheResponseDto {
  id!: string;
  createdAt!: string;
  constructor(entity: AddedItemAuto) {
    this.id = entity.id.toString();
    this.createdAt = entity.createdAt.toISOString() ?? new Date().toISOString();
  }
}
export class AddWishlistResponseDto {
  id!: string;
  createdAt!: string;
  constructor(entity: AddedItemManual) {
    this.id = entity.id.toString();
    this.createdAt = entity.createdAt.toISOString() ?? new Date().toISOString();
  }
}
export class ShowWishitemDetailResponseDto {
  id!: string;
  folder!: string | null;
  name!: string;
  price!: number;
  platform!: string;
  brand!: string | null;
  photoUrl!: string | null;
  productUrl!: string;
  reason!: string;
  refreshedAt!: string | null;
  addedAt!: string | null;
  updatedAt!: string | null;
  status!: string;
  constructor(param: {
    id: string;
    folder: string | null;
    name: string;
    price: number;
    platform: string;
    brand: string | null;
    photoUrl: string | null;
    productUrl: string;
    reason: string;
    refreshedAt: Date | null;
    addedAt: Date | null;
    updatedAt: Date | null;
    status: string;
  }) {
    this.id = param.id;
    this.folder = param.folder;
    this.name = param.name;
    this.price = param.price;
    this.platform = param.platform;
    this.brand = param.brand;
    this.photoUrl = param.photoUrl;
    this.productUrl = param.productUrl;
    this.reason = param.reason;
    this.refreshedAt = param.refreshedAt
      ? param.refreshedAt.toISOString()
      : null;
    this.addedAt = param.addedAt ? param.addedAt.toISOString() : null;
    this.updatedAt = param.updatedAt ? param.updatedAt.toISOString() : null;
    this.status = param.status;
  }
}
export class ShowWishitemListResponseDto {
  nextCursor!: string | null;
  wishitems!: WishItemPreviewPayload[];
  constructor(
    wishitems: WishlistRecordInterface[],
    nextCursor: string | null,
    photoUrls: Record<string, string | null>,
  ) {
    this.nextCursor = nextCursor;
    this.wishitems = wishitems.reduce<WishItemPreviewPayload[]>(
      (acc, wishitem) => {
        acc.push({
          id: wishitem.id.toString(),
          brandName: wishitem.brandName,
          name: wishitem.name,
          price: wishitem.price,
          photoUrl: photoUrls[wishitem.cursor],
          type: wishitem.type,
          status: wishitem.status,
        });
        return acc;
      },
      [],
    );
  }
}
export class ShowWishitemFoldersResponseDto {
  folders!: WishItemFolderPayload[];
  nextCursor!: string | null;
  constructor(param: { folders: WishItemFolder[]; nextCursor: string | null }) {
    this.folders = param.folders.map<WishItemFolderPayload>((folder) => ({
      id: folder.id.toString(),
      name: folder.name,
    }));
    this.nextCursor = param.nextCursor;
  }
}
export class CreateWishitemFolderResponseDto {
  folderId!: string;
  createdAt!: string;
  constructor(id: string) {
    this.folderId = id;
    this.createdAt = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });
  }
}
export class ShowWishitemsInFolderResponseDto {
  nextCursor!: string | null;
  wishitems!: WishItemPreviewPayload[];
  constructor(
    wishitems: WishlistRecordInterface[],
    nextCursor: string | null,
    photoUrls: Record<string, string | null>,
  ) {
    this.nextCursor = nextCursor;
    this.wishitems = wishitems.reduce<WishItemPreviewPayload[]>(
      (acc, wishitem) => {
        acc.push({
          id: wishitem.id.toString(),
          brandName: wishitem.brandName,
          name: wishitem.name,
          price: wishitem.price,
          photoUrl: photoUrls[wishitem.cursor],
          type: wishitem.type,
          status: wishitem.status,
        });
        return acc;
      },
      [],
    );
  }
}
export class ModifyWishitemResponseDto {
  id!: string;
  folder!: string | null;
  name!: string;
  price!: number;
  platform!: string;
  brand!: string | null;
  photoUrl!: string | null;
  productUrl!: string;
  reason!: string;
  refreshedAt!: string | null;
  addedAt!: string | null;
  updatedAt!: string | null;
  status!: string;
  constructor(data: WishItemPayload) {
    this.id = data.id;
    this.folder = data.folder;
    this.name = data.name;
    this.price = data.price;
    this.platform = data.platform;
    this.brand = data.brand;
    this.photoUrl = data.photoUrl;
    this.productUrl = data.productUrl;
    this.reason = data.reason;
    this.refreshedAt = data.refreshedAt ? data.refreshedAt.toISOString() : null;
    this.addedAt = data.addedAt ? data.addedAt.toISOString() : null;
    this.updatedAt = data.updatedAt ? data.updatedAt.toISOString() : null;
    this.status = data.status;
  }
}
export class GetWishListAnalyticsResponseDto {
  droppedItems: { totalCount: number; totalPrice: number };
  boughtItems: { totalCount: number; totalPrice: number };
  constructor(param: {
    droppedItems: { totalCount: number; totalPrice: number };
    boughtItems: { totalCount: number; totalPrice: number };
  }) {
    this.droppedItems = param.droppedItems;
    this.boughtItems = param.boughtItems;
  }
}
