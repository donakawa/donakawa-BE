export class AddWishListCommand {
  readonly userId!: string;
  readonly name!: string;
  readonly price!: number;
  readonly url!: string;
  readonly storeName!: string;
  readonly brandName!: string;
  readonly photoFileId!: string | undefined;
  readonly reason!: string;
  constructor(data: {
    userId: string;
    name: string;
    price: number;
    url: string;
    storeName: string;
    brandName: string;
    photoFileId: string | undefined;
    reason: string;
  }) {
    this.userId = data.userId;
    this.name = data.name;
    this.price = data.price;
    this.url = data.url;
    this.storeName = data.storeName;
    this.brandName = data.brandName;
    this.photoFileId = data.photoFileId;
    this.reason = data.reason;
  }
}
