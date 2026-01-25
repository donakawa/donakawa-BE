import { WishitemStatus, WishitemType } from "../types/wishitem.types";

export class WishItemPayload {
  id!: string;
  folder!: string | null;
  name!: string;
  price!: number;
  platform!: string;
  brand!: string | null;
  photoUrl!: string | null;
  productUrl!: string;
  reason!: string;
  refreshedAt!: Date | null;
  addedAt!: Date | null;
  updatedAt!: Date | null;
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
    this.refreshedAt = param.refreshedAt;
    this.addedAt = param.addedAt;
    this.updatedAt = param.updatedAt;
    this.status = param.status;
  }
}
export class WishItemPreviewPayload {
  id!: string;
  name!: string;
  price!: number;
  photoUrl!: string | null;
  type!: WishitemType;
  status!: WishitemStatus;
  constructor(param: {
    id: string;
    name: string;
    price: number;
    photoUrl: string | null;
    type: WishitemType;
    status: WishitemStatus;
  }) {
    this.id = param.id;
    this.name = param.name;
    this.price = param.price;
    this.photoUrl = param.photoUrl;
    this.type = param.type;
    this.status = param.status;
  }
}
