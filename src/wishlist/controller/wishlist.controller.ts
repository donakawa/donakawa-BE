import {
  Body,
  Post,
  Route,
  Tags,
  Path,
  Request,
  Controller,
  Get,
  Produces,
  FormField,
  UploadedFile,
  Middlewares,
  Security,
  Query,
  BodyProp,
  Delete,
  SuccessResponse,
  Patch,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { container } from "../../container";
import { WishlistService } from "../service/wishlist.service";
import { ApiResponse, success } from "../../common/response";
import {
  AddCrawlTaskRequestDto,
  AddWishListFromCacheRequestDto,
  AddWishListRequestDto,
  ChangeWishitemFolderLocationRequestDto,
  CreateWishitemFolderRequestDto,
  DeleteItemRequestDto,
  DeleteWishitemFolderRequestDto,
  MarkItemAsDroppedRequestDto,
  MarkItemAsPurchasedRequestDto,
  ModifyWishitemReasonRequestDto,
  ModifyWishitemRequestDto,
  ShowWishitemFoldersRequestDto,
  ShowWishitemListRequestDto,
  ShowWishitemsInFolderRequestDto,
} from "../dto/request/wishlist.request.dto";
import {
  AddCrawlTaskResponseDto,
  AddWishListFromCacheResponseDto,
  AddWishlistResponseDto,
  CreateWishitemFolderResponseDto,
  GetCrawlResultResponseDto,
  ModifyWishitemResponseDto,
  ShowWishitemDetailResponseDto,
  ShowWishitemFoldersResponseDto,
  ShowWishitemListResponseDto,
  ShowWishitemsInFolderResponseDto,
} from "../dto/response/wishlist.response.dto";
import { validateImageFile } from "../policy/upload.policy";
import { BadRequestException } from "../../errors/error";
import { WishitemType } from "../types/wishitem.types";

@Route("/wishlist")
@Tags("Wishlist")
export class WishlistController extends Controller {
  private readonly wishlistService: WishlistService =
    container.wishlist.service;
  /**
   * @summary 위시리스트 추가를 위한 크롤링 작업 요청
   * @description 위시리스트 추가를 위한 크롤링 작업을 요청합니다.
   */
  @Post("/crawl-tasks")
  @Security("jwt")
  public async addCrawlTask(
    @Body() body: AddCrawlTaskRequestDto,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<AddCrawlTaskResponseDto>> {
    const userId = req.user!.id;
    return success(await this.wishlistService.enqueueItemCrawl(body, userId));
  }
  /**
   * @summary 위시리스트 크롤링 작업 이벤트 수신
   * @description SSE(Server-Sent Events)를 통해 위시리스트 크롤링 작업의 진행 상황을 실시간으로 수신합니다.
   */
  @Get("/crawl-tasks/:jobId/events")
  @Security("jwt")
  @Produces("text/event-stream")
  public async listenCrawlEvents(
    @Request() req: ExpressRequest,
    @Path("jobId") jobId: string,
  ): Promise<void> {
    const res = req.res!;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.write(`event: connected\ndata: ${JSON.stringify({ jobId })}\n\n`);
    res.flushHeaders();
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) {
        res.write(":\n\n");
      }
    }, 15000);
    const cleanup = () => {
      clearInterval(heartbeat);
      if (!res.writableEnded) {
        res.end();
      }
    };
    try {
      const result = await this.wishlistService.subscribeCrawlEvents(jobId);
      clearInterval(heartbeat);
      res.write(`event: done\ndata: ${JSON.stringify({ result })}\n\n`);
    } catch (e: any) {
      if (!res.writableEnded) {
        res.write(
          `event: error\ndata: ${JSON.stringify({ message: e.message })}\n\n`,
        );
      }
    } finally {
      cleanup();
    }
  }
  /**
   * @summary 위시리스트 크롤링 결과 조회
   * @description 위시리스트 크롤링 작업의 결과를 조회합니다.
   */
  @Get("/crawl-tasks/:cacheId/result")
  @Security("jwt")
  public async getCrawlResult(
    @Path("cacheId") cacheId: string,
  ): Promise<ApiResponse<GetCrawlResultResponseDto>> {
    const result = await this.wishlistService.getCrawlResult(cacheId);
    return success(result);
  }
  /**
   * @summary 위시리스트 캐시로부터 아이템 추가
   * @description 캐시에 저장된 상품 정보를 기반으로 위시리스트에 아이템을 추가합니다.
   */
  @Post("/items/from-cache")
  @Security("jwt")
  public async addWishListFromCache(
    @BodyProp("cacheId") cacheId: string,
    @BodyProp("reason") reason: string,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<AddWishListFromCacheResponseDto>> {
    const userId = req.user!.id;
    const dto = new AddWishListFromCacheRequestDto({ cacheId, userId, reason });
    return success(await this.wishlistService.addWishListFromCache(dto));
  }
  /**
   * @summary 위시 아이템 수동 등록
   * @description 위시 아이템을 수동으로 등록합니다.
   */
  @Post("/items")
  @Security("jwt")
  @Middlewares(validateImageFile)
  public async addWishList(
    @FormField() productName: string,
    @FormField() price: number,
    @FormField() storeName: string,
    @FormField() brandName: string,
    @FormField() reason: string,
    @FormField() url: string,
    @Request() req: ExpressRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<AddWishlistResponseDto>> {
    const userId = req.user!.id;
    const dto = new AddWishListRequestDto({
      productName,
      price,
      storeName,
      brandName,
      reason,
      url,
      userId,
      photoFile: file,
    });
    return success(await this.wishlistService.addWishListManual(dto));
  }
  /**
   * @summary 위시리스트 아이템 상세 조회 (위시/구매/포기 아이템 모두 포함)
   * @description 위시/구매/포기 아이템을 모두 포함하여 지정한 한개의 아이템을 상세 조회합니다.
   */

  @Get("/items/:itemId")
  @Security("jwt")
  public async showWishitemDetail(
    @Path("itemId") itemId: string,
    @Query("type") type: string,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<ShowWishitemDetailResponseDto>> {
    if (!itemId.match(/^(0|[1-9]\d*)$/))
      throw new BadRequestException(
        "INVALID_INPUT_FORM",
        "유효하지 않은 입력 값 입니다.",
      );
    const userId = req.user!.id;
    return success(
      await this.wishlistService.getWishlistItemInfo(itemId, type, userId),
    );
  }
  /**
   * @summary 위시리스트 가져오기(위시/구매/포기 아이템 모두 포함)
   * @description 위시/구매/포기 아에팀중 한 분류를 선택하여 아이템 리스트를 가져옵니다.
   */
  @Get("/items")
  @Security("jwt")
  public async showWishitemList(
    @Request() req: ExpressRequest,
    @Query("status") status: string,
    @Query("take") take: number,
    @Query("cursor") cursor?: string,
  ): Promise<ApiResponse<ShowWishitemListResponseDto>> {
    const userId = req.user!.id;
    const dto = new ShowWishitemListRequestDto({
      userId,
      status,
      cursor,
      take,
    });
    return success(await this.wishlistService.getWishlist(dto));
  }
  /**
   * @summary 위시 리스트 폴더 리스트 가져오기
   * @description 위시 리스트 폴더 목록을 가져옵니다.
   */
  @Get("/folders")
  @Security("jwt")
  public async showWishitemFolders(
    @Request() req: ExpressRequest,
    @Query("take") take: number,
    @Query("cursor") cursor?: string,
  ): Promise<ApiResponse<ShowWishitemFoldersResponseDto>> {
    const userId = req.user!.id;
    const dto = new ShowWishitemFoldersRequestDto({ cursor, take, userId });
    return success(await this.wishlistService.getWishitemFolders(dto));
  }
  /**
   * @summary 위시 리스트 폴더 생성 하기
   * @description 새로운 위시 리스트 폴더를 생성 합니다.
   */
  @Post("/folders")
  @Security("jwt")
  @SuccessResponse(201, "Created")
  public async createWishitemFolder(
    @BodyProp("name") name: string,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<CreateWishitemFolderResponseDto>> {
    const userId = req.user!.id;
    const dto = new CreateWishitemFolderRequestDto({ name, userId });
    return success(await this.wishlistService.addWishitemFolders(dto));
  }
  /**
   * @summary 위시 리스트 폴더 삭제 하기
   * @description 기존 위시 리시트 폴더의 아이템을 해제하고, 폴더를 제거합니다.
   */
  @Delete("/folders/:folderId")
  @Security("jwt")
  @SuccessResponse(204, "Deleted")
  public async deleteWishitemFolder(
    @Path("folderId") folderId: string,
    @Request() req: ExpressRequest,
  ) {
    const userId = req.user!.id;
    const dto = new DeleteWishitemFolderRequestDto({ folderId, userId });
    await this.wishlistService.removeWishitemFolder(dto);
  }
  /**
   * @summary 위시 아이템 폴더 위치 변경
   * @description 위시 아이템의 폴더 위치를 지정한 폴더로 변경 합니다.
   */
  @Patch("/items/:itemId/folder")
  @Security("jwt")
  @SuccessResponse(204, "Updated")
  public async changeWishitemFolderLocation(
    @Path("itemId") itemId: string,
    @Body() body: ChangeWishitemFolderLocationRequestDto,
    @Request() req: ExpressRequest,
  ) {
    const userId = req.user!.id;
    await this.wishlistService.setWishitemFolder(body, itemId, userId);
  }
  /**
   * @summary 위시 아이템 구매 결정
   * @description 위시 아이템의 상태를 구매 결정으로 변경 합니다.
   */
  @Post("/items/:itemId/buy")
  @Security("jwt")
  @SuccessResponse(204, "Updated")
  public async markItemAsPurchased(
    @Body() body: MarkItemAsPurchasedRequestDto,
    @Path("itemId") itemId: string,
    @Request() req: ExpressRequest,
  ) {
    if (!/^\d+$/.exec(itemId))
      throw new BadRequestException(
        "INVALID_ITEM_ID",
        "올바르지 않은 아이템 ID 입니다.",
      );
    const userId = req.user!.id;
    await this.wishlistService.markWishitemAsPurchased(body, itemId, userId);
  }
  /**
   * @summary 위시 아이템 구매 포기
   * @description 위시 아이템의 상태를 구매 포기로 변경 합니다.
   */
  @Post("/items/:itemId/drop")
  @Security("jwt")
  @SuccessResponse(204, "Updated")
  public async markItemAsDropped(
    @Path("itemId") itemId: string,
    @BodyProp("type") type: WishitemType,
    @Request() req: ExpressRequest,
  ) {
    const userId = req.user!.id;
    const dto = new MarkItemAsDroppedRequestDto({ itemId, userId, type });
    await this.wishlistService.markWishitemAsDropped(dto);
  }
  /**
   * @summary 위시 아이템 삭제
   * @description 위시 아이템을 삭제합니다.
   */
  @Delete("/items/:itemId")
  @Security("jwt")
  @SuccessResponse(204, "Deleted")
  public async deleteItem(
    @Path("itemId") itemId: string,
    @Query("type") type: WishitemType,
    @Request() req: ExpressRequest,
  ) {
    const userId = req.user!.id;
    const dto = new DeleteItemRequestDto({ itemId, type, userId });
    await this.wishlistService.deleteWishitem(dto);
  }
  /**
   * @summary 폴더별 위시 아이템 조회하기 (WISHLISTED만)
   * @description 폴더별로 위시 아이템 목록을 가져옵니다.
   */
  @Get("/folders/:folderId/items")
  @Security("jwt")
  public async showWishitemsInFolder(
    @Request() req: ExpressRequest,
    @Path("folderId") folderId: string,
    @Query("take") take: number,
    @Query("cursor") cursor?: string,
  ): Promise<ApiResponse<ShowWishitemsInFolderResponseDto>> {
    const userId = req.user!.id;
    const dto = new ShowWishitemsInFolderRequestDto({
      userId,
      folderId,
      cursor,
      take,
    });
    return success(await this.wishlistService.getWishitemsInFolder(dto));
  }
  /**
   * @summary 위시 아이템 추가 이유 수정
   * @description 위시 아이템으로 추가한 이유를 수정합니다.
   */
  @Patch("/items/:itemId/reason")
  @Security("jwt")
  @SuccessResponse(204, "Updated")
  public async modifyWishitemReason(
    @Path("itemId") itemId: string,
    @BodyProp("reason") reason: string,
    @BodyProp("type") type: WishitemType,
    @Request() req: ExpressRequest,
  ) {
    const userId = req.user!.id;
    const dto = new ModifyWishitemReasonRequestDto({
      itemId,
      userId,
      reason,
      type,
    });
    await this.wishlistService.setWishitemReason(dto);
  }
  /**
   * @summary 위시리스트 아이템 수정 (수동 등록 아이템 만)
   * @description 위시/구매/포기 아이템을 모두 포함하여 수동으로 등록한 아이템의 정보를 수정 합니다.
   */
  @Patch("/items/:itemId")
  @Security("jwt")
  @Middlewares(validateImageFile)
  public async modifyWishitem(
    @Path("itemId") itemId: string,
    @Request() req: ExpressRequest,
    @FormField("productName") productName?: string,
    @FormField("price") price?: number,
    @FormField("url") url?: string,
    @FormField("storeName") storeName?: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<ModifyWishitemResponseDto>> {
    if (!/^\d+$/.exec(itemId))
      throw new BadRequestException(
        "INVALID_ITEM_ID",
        "올바르지 않은 아이템 ID 입니다.",
      );
    const userId = req.user!.id;
    const dto = new ModifyWishitemRequestDto({
      productName,
      price,
      url,
      storeName,
    });
    return success(
      await this.wishlistService.updateWishitemInfo(itemId, userId, dto, file),
    );
  }
}
