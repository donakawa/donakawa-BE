import { WishitemStatus, WishitemType } from "../types/wishitem.types";

export interface WishlistRecordInterface {
  id: bigint;
  name: string;
  brandName: string | null;
  price: number;
  photoFileId: bigint | null;
  url: string;
  createdAt: Date;
  status: WishitemStatus;
  folderId: bigint | null;
  type: WishitemType;
  cursor: string;
}
