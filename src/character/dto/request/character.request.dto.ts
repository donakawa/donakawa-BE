import { IsNumber, IsOptional } from "class-validator";

export class PurchaseItemRequestDto {
  @IsNumber()
  itemId!: number;
}

export class EquipItemRequestDto {
  @IsOptional()
  @IsNumber()
  skinId?: number;

  @IsOptional()
  @IsNumber()
  accessoryId?: number;

  @IsOptional()
  @IsNumber()
  wallpaperId?: number;

  @IsOptional()
  @IsNumber()
  floorId?: number;
}
