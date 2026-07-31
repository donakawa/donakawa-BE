import {
  Body,
  Example,
  Response,
  Get,
  Post,
  Patch,
  Put,
  Route,
  SuccessResponse,
  Tags,
  Security,
  Request,
  Query,
  Middlewares,
} from "tsoa";
import { AppError } from "../../errors/app.error";
import { ApiResponse, success } from "../../common/response";
import { Request as ExpressRequest } from "express";
import {
  PurchaseItemRequestDto,
  EquipItemRequestDto,
} from "../dto/request/character.request.dto";
import {
  HamsterTalkResponseDto,
  HamsterInfoResponseDto,
  ShopItemsResponseDto,
  CleanPooResponseDto,
} from "../dto/response/character.response.dto";
import { CharacterService } from "../service/character.service";
import { container } from "../../container";
import { ItemCategory } from "@prisma/client";

@Route("/character")
@Tags("Character")
@Security("jwt")
export class CharacterController {
  private readonly characterService: CharacterService =
    container.character.service;

  /**
   * @summary 도나햄 한마디 조회 API
   */
  @Get("/comment")
  @SuccessResponse("200", "도나햄 한마디 조회 성공")
  public async getHamsterTalk(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<HamsterTalkResponseDto>> {
    const userId = req.user!.id;
    const data = await this.characterService.getHamsterTalk(userId);

    return success(data);
  }

  /**
   * @summary 햄꾸 화면 조회 API
   */
  @Get()
  @SuccessResponse("200", "햄꾸 화면 조회 성공")
  public async getHamster(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<HamsterInfoResponseDto>> {
    const userId = req.user!.id;
    const data = await this.characterService.getHamster(userId);

    return success(data);
  }

  /**
   * @summary 햄꾸 카테고리별 아이템 조회 API
   */
  @Get("/items")
  @SuccessResponse("200", "햄꾸 카테고리별 아이템 조회 성공")
  public async getShopItems(
    @Request() req: ExpressRequest,
    @Query() category: ItemCategory,
  ): Promise<ApiResponse<ShopItemsResponseDto>> {
    const userId = req.user!.id;
    const data = await this.characterService.getShopItems(userId, category);

    return success(data);
  }

  /**
   * @summary 햄꾸 아이템 구매 API
   */
  @Post("/purchase")
  @SuccessResponse("201", "햄꾸 아이템 구매 성공")
  public async purchaseShopItems(
    @Request() req: ExpressRequest,
    @Body() body: PurchaseItemRequestDto,
  ): Promise<ApiResponse<void>> {
    const userId = req.user!.id;
    const data = await this.characterService.purchaseShopItems(
      userId,
      body.itemId,
    );

    return success(data);
  }

  /**
   * @summary 햄꾸 아이템 적용 API
   */
  @Patch("/equip")
  @SuccessResponse("200", "햄꾸 아이템 적용 성공")
  public async equipShopItems(
    @Request() req: ExpressRequest,
    @Body() body: EquipItemRequestDto,
  ): Promise<ApiResponse<void>> {
    const userId = req.user!.id;
    const data = await this.characterService.equipShopItems(userId, body);

    return success(data);
  }

  /**
   * @summary 청소 보상 API
   */
  @Post("/poo/clean")
  @SuccessResponse("200", "청소 보상 획득 성공")
  public async cleanPoo(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<CleanPooResponseDto>> {
    const userId = req.user!.id;
    const data = await this.characterService.cleanPoo(userId);

    return success(data);
  }
}
