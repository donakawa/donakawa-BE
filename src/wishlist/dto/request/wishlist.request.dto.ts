import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
} from "class-validator";

import { WishitemStatus } from "../../types/wishitem.types";
import { Type } from "class-transformer";
export class AddCrawlTaskRequestDto {
  @IsUrl()
  @IsNotEmpty()
  url!: string;
}
export class AddWishListRequestDto {
  @IsNotEmpty()
  @IsString()
  productName!: string;
  @IsNotEmpty()
  @IsNumber()
  price!: number;
  @IsUrl()
  @IsString()
  url!: string;
  @IsNotEmpty()
  @IsString()
  storeName!: string;
  @IsNotEmpty()
  @IsString()
  brandName!: string;
  @IsString()
  reason!: string;
  @IsString()
  userId!: string;
  photoFile?: Express.Multer.File;
  constructor(data: {
    userId: string;
    productName: string;
    price: number;
    url: string;
    storeName: string;
    brandName: string;
    reason: string;
    photoFile?: Express.Multer.File;
  }) {
    this.userId = data.userId;
    this.productName = data.productName;
    this.price = data.price;
    this.url = data.url;
    this.storeName = data.storeName;
    this.brandName = data.brandName;
    this.reason = data.reason;
    this.photoFile = data.photoFile;
  }
}
export class AddWishListFromCacheRequestDto {
  @Matches(/^\d+$/, { message: "cacheId must be a valid integer string" })
  @IsNotEmpty()
  cacheId!: string;
  @Matches(/^\d+$/, { message: "userId must be a valid integer string" })
  @IsNotEmpty()
  userId!: string;
  constructor(param: { cacheId: string; userId: string }) {
    this.cacheId = param.cacheId;
    this.userId = param.userId;
  }
}
export class ShowWishitemListRequestDto {
  @Matches(/^\d+$/, { message: "userId must be a valid integer string" })
  @IsNotEmpty()
  userId!: string;

  @IsIn([
    "WISHLISTED",
    "DROPPED",
    "BOUGHT",
  ] as const satisfies readonly WishitemStatus[])
  @IsNotEmpty()
  status!: string;

  @Matches(/^[AM]\d{26}$/)
  @IsOptional()
  cursor!: string | undefined;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  take!: number;
  constructor(param: {
    userId: string;
    status: string;
    cursor: string | undefined;
    take: number;
  }) {
    this.userId = param.userId;
    this.status = param.status;
    this.cursor = param.cursor;
    this.take = param.take;
  }
}
