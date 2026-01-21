import { IsNotEmpty, IsNumberString, IsUrl } from "class-validator";

export class AddCrawlTaskRequestDto {
  @IsUrl()
  @IsNotEmpty()
  url!: string;
}
export class AddWishListRequestDto {}
export class AddWishListFromCacheRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  cacheId!: string;
  @IsNumberString()
  @IsNotEmpty()
  userId!: string;
}
