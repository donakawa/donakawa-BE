export class AddWishListFromCacheCommand {
  readonly cacheId: string;
  readonly userId: string;
  readonly reason: string;
  constructor(cacheId: string, userId: string, reason: string) {
    this.cacheId = cacheId;
    this.userId = userId;
    this.reason = reason;
  }
}
