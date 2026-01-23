import { TimeUnit } from "@valkey/valkey-glide";
import { ConflictException, NotFoundException } from "../../errors/error";
import { ValkeyClient } from "../../infra/valkey.client";
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
import { CrawlQueueClient } from "../infra/crawl-queue.client";
import { CrawlRequestMessage } from "../messages/crawl-request.message";
import { WishlistRepository } from "../repository/wishlist.repository";
import { v4 as uuid } from "uuid";
import { EventEmitterClient } from "../infra/event-emitter.client";
import { EventType } from "../../enum/event-type.enum";
import { CrawlStatusUpdatedPayload } from "../../interface/event-payload.interface";
import { AddWishListFromCacheCommand } from "../command/add-wishlist-from-cache.command";
import { AddWishListCommand } from "../command/add-wishlist.command";
import { FilesService } from "../../files/service/files.service";
import { FileType } from "@prisma/client";
import { FileTypeEnum } from "../../files/enum/file-type.enum";
import { FilePayload } from "../../files/payload/file.payload";
import path from "path";
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly crawlQueueClient: CrawlQueueClient,
    private readonly valkeyClientPromise: Promise<ValkeyClient>,
    private readonly eventEmitterClient: EventEmitterClient,
    private readonly filesService: FilesService,
  ) {}
  async enqueueItemCrawl(
    data: AddCrawlTaskRequestDto,
  ): Promise<AddCrawlTaskResponseDto> {
    const valkeyClient = await this.valkeyClientPromise;
    const jobId = uuid();
    const message = new CrawlRequestMessage(jobId, data.url);
    await this.crawlQueueClient.enqueueCrawl(message);
    const sentAt = new Date().toISOString();
    await valkeyClient.valkeyPub.set(
      `status:crawl:${jobId}:status`,
      "PENDING",
      {
        expiry: { type: TimeUnit.Seconds, count: 60 * 30 },
      },
    );
    return new AddCrawlTaskResponseDto(jobId, sentAt);
  }
  async subscribeCrawlEvents(jobId: string) {
    const valkeyClient = await this.valkeyClientPromise;
    const currentValue = await valkeyClient.valkeyPub.get(
      `status:crawl:${jobId}:status`,
    );
    if (!currentValue) {
      throw new NotFoundException(
        "JOB_ID_NOT_FOUND",
        "존재하지 않는 작업 ID 입니다.",
      );
    }
    if (currentValue === "DONE" || currentValue === "FAILED") {
      return currentValue as "DONE" | "FAILED";
    }
    const topic = EventType.CRAWL_STATUS_UPDATED;

    type resultValueType = {
      result: "DONE" | "FAILED" | null;
      dataId: string | null;
    };

    const TIMEOUT_MS = 1000 * 120; // 2 minutes
    return new Promise<resultValueType>(async (resolve, reject) => {
      let result: "DONE" | "FAILED" | null = null;
      const handler = async (payload: CrawlStatusUpdatedPayload) => {
        if (!payload.jobId || payload.jobId !== jobId) return;
        try {
          valkeyClient.valkeyPub
            .get(`status:crawl:${jobId}:status`)
            .then((statusResult) => {
              if (statusResult === "DONE" || statusResult === "FAILED") {
                this.eventEmitterClient.off<CrawlStatusUpdatedPayload>(
                  topic,
                  handler,
                );
                return this.valkeyClientPromise
                  .then(async (valkeyClient) =>
                    valkeyClient.valkeyPub.get(
                      `status:crawl:${jobId}:resultId`,
                    ),
                  )
                  .then((dataId) => {
                    resolve({
                      result,
                      dataId: dataId?.toString() ?? null,
                    });
                  });
              }
            });
        } catch (e) {
          this.eventEmitterClient.off(topic, handler);
          resolve({ result, dataId: null });
        }
      };
      setTimeout(() => {
        this.eventEmitterClient.off<CrawlStatusUpdatedPayload>(topic, handler);
        reject(new Error("Crawl event subscription timed out"));
      }, TIMEOUT_MS);
      this.eventEmitterClient.on<CrawlStatusUpdatedPayload>(topic, handler);
    });
  }
  async getCrawlResult(cacheId: string) {
    const result = await this.wishlistRepository.findProductById(cacheId);
    if (!result) {
      throw new NotFoundException(
        "CRAWL_RESULT_NOT_FOUND",
        "크롤링 결과를 찾을 수 없습니다.",
      );
    }
    return new GetCrawlResultResponseDto(result, result.storePlatform.name);
  }
  async addWishListFromCache(data: AddWishListFromCacheRequestDto) {
    const command = new AddWishListFromCacheCommand(data.cacheId, data.userId);
    const isAlreadyExist =
      (await this.wishlistRepository.findAddedItemAutoByProductId(
        command.cacheId,
      )) !== null;
    if (isAlreadyExist) {
      throw new ConflictException(
        "WISHLIST_ALREADY_EXIST",
        "이미 위시리스트에 추가된 상품입니다.",
      );
    }
    const isProductExist =
      (await this.wishlistRepository.findProductById(command.cacheId)) !== null;
    if (!isProductExist) {
      throw new NotFoundException(
        "PRODUCT_NOT_FOUND",
        "존재하지 않는 상품입니다.",
      );
    }
    const savedEntity =
      await this.wishlistRepository.saveAddedItemAuto(command);
    return new AddWishListFromCacheResponseDto(savedEntity);
  }
  async addWishListManual(dto: AddWishListRequestDto) {
    const isAlreadyExist =
      (await this.wishlistRepository.findAddedItemManualByUrl(
        dto.url,
        dto.userId,
        {
          select: { id: true },
        },
      )) !== null;
    if (isAlreadyExist) {
      throw new ConflictException(
        "WISHLIST_ALREADY_EXIST",
        "이미 위시리스트에 추가된 상품입니다. (URL 기준)",
      );
    }
    let uploadedResultPayload: FilePayload | null = null;
    const fileName = uuid();
    try {
      if (dto.photoFile)
        uploadedResultPayload = await this.filesService.upload(
          dto.photoFile,
          fileName,
          FileTypeEnum.MANUAL_ADDED_PRODUCT_PHOTO,
        );
      const command = new AddWishListCommand({
        userId: dto.userId,
        name: dto.productName,
        price: dto.price,
        storeName: dto.storeName,
        brandName: dto.brandName,
        reason: dto.reason,
        photoFileId: uploadedResultPayload?.id,
        url: dto.url,
      });

      const savedEntity =
        await this.wishlistRepository.saveAddedItemManual(command);
      return new AddWishlistResponseDto(savedEntity);
    } catch (e) {
      if (dto.photoFile && uploadedResultPayload) {
        const ext = path.extname(dto.photoFile?.originalname).toLowerCase();
        const name = `${fileName}${ext}`;
        await this.filesService.delete(
          name,
          FileTypeEnum.MANUAL_ADDED_PRODUCT_PHOTO,
        );
      }
      throw e;
    }
  }
}
