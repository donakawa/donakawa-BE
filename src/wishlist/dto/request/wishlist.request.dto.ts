import { IsNotEmpty, IsNumberString, IsUrl, Matches } from "class-validator";

export class AddCrawlTaskRequestDto {
  @IsUrl()
  @IsNotEmpty()
  url!: string;
}
export class AddWishListRequestDto {}
export class AddWishListFromCacheRequestDto {
  @Matches(/^\d+$/, { message: "cacheId must be a valid integer string" })
  @IsNotEmpty()
  cacheId!: string;
  @Matches(/^\d+$/, { message: "userId must be a valid integer string" })
  @IsNotEmpty()
  userId!: string;
}
