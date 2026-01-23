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
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { container } from "../../container";
import { WishlistService } from "../service/wishlist.service";
import { ApiResponse, success } from "../../common/response";
import {
  AddCrawlTaskRequestDto,
  AddWishListFromCacheRequestDto,
  AddWishListRequestDto,
} from "../dto/request/wishlist.request.dto";
import {
  AddCrawlTaskResponseDto,
  AddWishListFromCacheResponseDto,
  AddWishlistResponseDto,
  GetCrawlResultResponseDto,
} from "../dto/response/wishlist.response.dto";
import { validateImageFile } from "../policy/upload.policy";

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
  public async addWishListFromCache(
    @Body() body: AddWishListFromCacheRequestDto,
  ): Promise<ApiResponse<AddWishListFromCacheResponseDto>> {
    body.userId = "1"; // TODO: 임시 유저 아이디 하드코딩, 추후 인증 구현시 변경 필요
    return success(await this.wishlistService.addWishListFromCache(body));
  }
  @Post("/items")
  @Middlewares(validateImageFile)
  public async addWishList(
    @FormField() productName: string,
    @FormField() price: number,
    @FormField() storeName: string,
    @FormField() brandName: string,
    @FormField() reason: string,
    @FormField() url: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<AddWishlistResponseDto>> {
    const userId = "1"; // TODO: 임시 유저 아이디 하드코딩, 추후 인증 구현시 변경 필요
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
}
