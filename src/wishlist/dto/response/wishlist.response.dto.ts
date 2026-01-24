import {
  AddedItemAuto,
  AddedItemManual,
  Product,
  StorePlatform,
} from "@prisma/client";

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
    this.platformName = storePlatformName;
    this.productId = entity.productId;
    this.price = entity.price;
    this.updatedAt =
      entity.updatedAt!.toISOString() ?? new Date().toISOString();
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
