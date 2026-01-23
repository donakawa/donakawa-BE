export class AddWishListFromCacheCommand {
  readonly cacheId: string;
  readonly userId: string;
  constructor(cacheId: string, userId: string) {
    this.cacheId = cacheId;
    this.userId = userId;
  }
}
