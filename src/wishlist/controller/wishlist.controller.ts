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
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { container } from "../../container";
import { WishlistService } from "../service/wishlist.service";
import { ApiResponse, success } from "../../common/response";
import {
  AddCrawlTaskRequestDto,
  AddWishListFromCacheRequestDto,
  AddWishListRequestDto,
  ShowWishitemListRequestDto,
} from "../dto/request/wishlist.request.dto";
import {
  AddCrawlTaskResponseDto,
  AddWishListFromCacheResponseDto,
  AddWishlistResponseDto,
  GetCrawlResultResponseDto,
  ShowWishitemDetailResponseDto,
  ShowWishitemListResponseDto,
} from "../dto/response/wishlist.response.dto";
import { validateImageFile } from "../policy/upload.policy";
import { BadRequestException } from "../../errors/error";
import { IsOptional } from "class-validator";

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
  ): Promise<ApiResponse<AddCrawlTaskResponseDto>> {
    return success(await this.wishlistService.enqueueItemCrawl(body));
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
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<AddWishListFromCacheResponseDto>> {
    const userId = req.user!.id;
    const dto = new AddWishListFromCacheRequestDto({ cacheId, userId });
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
}
