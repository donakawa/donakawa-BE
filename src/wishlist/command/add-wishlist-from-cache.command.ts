export class AddWishListFromCacheCommand {
  readonly cacheId: string;
  readonly userId: string;
  constructor(cachedId: string, userId: string) {
    this.cacheId = cachedId;
    this.userId = userId;
  }
}
