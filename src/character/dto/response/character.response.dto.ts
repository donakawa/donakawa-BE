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
  skinId!: number;
  accessoryId!: number | null;
  wallpaperId!: number;
  floorId!: number;
}

export class ShopResponseDto {
  coin!: number;
  equipped!: EquippedItemDto;

  constructor(data: ShopResponseDto) {
    Object.assign(this, data);
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
