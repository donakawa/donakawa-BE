export interface HamsterTalkInfo {
  conditionId: string;
  message: string;
}

export class HamsterTalkResponseDto {
  readonly conditionId: string;
  readonly message: string;

  constructor(entity: HamsterTalkInfo) {
    this.conditionId = entity.conditionId;
    this.message = entity.message;
  }
}

export class EquippedItemDto {
  itemId!: number;
  itemKey!: string;
  imageUrl!: string;

  constructor(partial: Partial<EquippedItemDto>) {
    Object.assign(this, partial);
  }
}

export class ShopResponseDto {
  coin!: number;

  equipped!: {
    skin: EquippedItemDto;
    accessory: EquippedItemDto;
    wallpaper: EquippedItemDto;
    floor: EquippedItemDto;
  };

  constructor(partial: Partial<ShopResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ShopItemDto {
  itemId!: number;
  name!: string;
  price!: number;
  imageUrl!: string;

  owned!: boolean;
  equipped!: boolean;
}

export class ShopItemsResponseDto {
  items!: ShopItemDto[];

  constructor(data: ShopItemsResponseDto) {
    Object.assign(this, data);
  }
}
