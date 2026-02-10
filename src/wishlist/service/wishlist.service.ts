import { TimeUnit } from "@valkey/valkey-glide";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../errors/error";
import { ValkeyClient } from "../../infra/valkey.client";
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
import { FileTypeEnum } from "../../files/enum/file-type.enum";
import { FilePayload } from "../../files/payload/file.payload";
import path from "path";
import {
  isWishitemStatus,
  isWishitemType,
  WishitemType,
} from "../types/wishitem.types";
import { WishItemPayload } from "../payload/wishlist.payload";
import { WishlistRecordInterface } from "../interface/wishlist.interface";
import { DbRepository } from "../../infra/db.repository";
import { HistoriesService } from "../../histories/service/histories.service";
export class WishlistService {
  constructor(
    private readonly dbRepository: DbRepository,
    private readonly wishlistRepository: WishlistRepository,
    private readonly crawlQueueClient: CrawlQueueClient,
    private readonly valkeyClientPromise: Promise<ValkeyClient>,
    private readonly eventEmitterClient: EventEmitterClient,
    private readonly filesService: FilesService,
    private readonly historiesService: HistoriesService,
  ) {}
  async enqueueItemCrawl(
    data: AddCrawlTaskRequestDto,
    userId: string,
  ): Promise<AddCrawlTaskResponseDto> {
    let url: URL;
    try {
      url = new URL(data.url);
    } catch {
      throw new BadRequestException(
        "INVALID_URL",
        "유효하지 않은 URL 형식입니다.",
      );
    }
    const isSupportedPlatform =
      (await this.wishlistRepository.findStorePlatformByUrlDomain(
        url.hostname,
      )) !== null;
    if (!isSupportedPlatform) {
      throw new BadRequestException(
        "UNSUPPORTED_PLATFORM",
        "지원하지 않는 쇼핑몰 플랫폼입니다.",
      );
    }
    const cleanUrl = url.origin + url.pathname.replace(/\/$/, "");
    const isAlreadyExistItem =
      (
        await this.wishlistRepository.findAddedItems(
          userId,
          1,
          undefined,
          undefined,
          undefined,
          cleanUrl,
        )
      ).length > 0;
    if (isAlreadyExistItem) {
      throw new ConflictException(
        "ITEM_ALREADY_EXIST",
        "이미 추가된 상품입니다.",
      );
    }
    const valkeyClient = await this.valkeyClientPromise;
    const jobId = uuid();
    const message = new CrawlRequestMessage(jobId, cleanUrl);
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
    const topic = EventType.CRAWL_STATUS_UPDATED;

    type resultValueType = {
      result: "DONE" | "FAILED" | null;
      dataId: string | null;
    };
    if (currentValue === "DONE" || currentValue === "FAILED") {
      const dataId =
        currentValue === "DONE"
          ? await valkeyClient.valkeyPub.get(`status:crawl:${jobId}:resultId`)
          : null;
      return {
        result: currentValue as "DONE" | "FAILED",
        dataId: dataId?.toString() ?? null,
      };
    }

    const TIMEOUT_MS = 1000 * 120; // 2 minutes
    return new Promise<resultValueType>(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.eventEmitterClient.off<CrawlStatusUpdatedPayload>(topic, handler);
        reject(new Error("Crawl event subscription timed out"));
      }, TIMEOUT_MS);
      const handler = async (payload: CrawlStatusUpdatedPayload) => {
        if (!payload.jobId || payload.jobId !== jobId) return;
        try {
          const client = await this.valkeyClientPromise;
          const statusResult = await client.valkeyPub.get(
            `status:crawl:${jobId}:status`,
          );
          if (statusResult !== "DONE" && statusResult !== "FAILED") return;
          const result = statusResult as "DONE" | "FAILED";
          this.eventEmitterClient.off<CrawlStatusUpdatedPayload>(
            topic,
            handler,
          );
          const dataId = await client.valkeyPub.get(
            `status:crawl:${jobId}:resultId`,
          );
          resolve({
            result,
            dataId: dataId?.toString() ?? null,
          });
        } catch (e) {
          this.eventEmitterClient.off<CrawlStatusUpdatedPayload>(
            topic,
            handler,
          );
          resolve({ result: "FAILED", dataId: null });
        } finally {
          clearTimeout(timeout);
        }
      };
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
    let imageUrl;
    if (result.photoFileId)
      imageUrl = await this.filesService.generateUrl(
        result.photoFileId.toString(),
        60 * 10,
      );
    if (!imageUrl) imageUrl = undefined;
    return new GetCrawlResultResponseDto(
      result,
      result.storePlatform.name,
      imageUrl,
    );
  }
  async addWishListFromCache(data: AddWishListFromCacheRequestDto) {
    const command = new AddWishListFromCacheCommand(
      data.cacheId,
      data.userId,
      data.reason,
    );
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
    let url: URL;
    try {
      url = new URL(dto.url);
    } catch {
      throw new BadRequestException(
        "INVALID_URL",
        "유효하지 않은 URL 형식입니다.",
      );
    }
    const cleanUrl = url.origin + url.pathname.replace(/\/$/, "");
    const isAlreadyExist =
      (
        await this.wishlistRepository.findAddedItems(
          dto.userId,
          1,
          undefined,
          undefined,
          undefined,
          cleanUrl,
        )
      ).length > 0;
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
        url: cleanUrl,
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
  async fetchWishitemDetails(id: string, userId: string, type: WishitemType) {
    if (type === "AUTO") {
      const wishitem = await this.wishlistRepository.findAddedItemAutoById(id, {
        select: {
          id: true,
          userId: true,
          wishItemFolder: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              storePlatform: {
                select: {
                  id: true,
                  name: true,
                  productUrlTemplate: true,
                },
              },
              photoFileId: true,
              productId: true,
              updatedAt: true,
            },
          },
          status: true,
          reason: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const isExist = wishitem !== null;
      const hasPermission = wishitem?.userId === BigInt(userId);
      if (!isExist || !hasPermission)
        throw new NotFoundException(
          "WISHITEM_NOT_FOUND",
          "해당하는 위시 아이템을 찾을 수 없습니다.",
        );
      const urlTemplate = wishitem.product.storePlatform.productUrlTemplate;
      const productId = wishitem.product.productId;
      const productUrl = urlTemplate.replace("${productId}", productId);
      const photoFileId = wishitem.product.photoFileId;
      const photoUrl = photoFileId
        ? await this.filesService.generateUrl(photoFileId.toString(), 60 * 10)
        : null;
      return new WishItemPayload({
        id: wishitem.id.toString(),
        folder: wishitem.wishItemFolder?.name ?? null,
        name: wishitem.product.name,
        price: wishitem.product.price,
        platform: wishitem.product.storePlatform.name,
        brand: null,
        photoUrl,
        productUrl,
        reason: wishitem.reason,
        refreshedAt: wishitem.product.updatedAt ?? null,
        addedAt: wishitem.createdAt ?? null,
        updatedAt: wishitem.updatedAt ?? null,
        status: wishitem.status,
      });
    } else {
      const wishitem = await this.wishlistRepository.findAddedItemManualById(
        id,
        {
          select: {
            id: true,
            userId: true,
            wishItemFolder: {
              select: {
                id: true,
                name: true,
              },
            },
            name: true,
            price: true,
            photoFileId: true,
            storePlatform: true,
            url: true,
            brand: true,
            reason: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      );
      const isExist = wishitem !== null;
      const hasPermission = wishitem?.userId === BigInt(userId);
      if (!isExist || !hasPermission)
        throw new NotFoundException(
          "WISHITEM_NOT_FOUND",
          "해당하는 위시 아이템을 찾을 수 없습니다.",
        );
      const photoFileId = wishitem.photoFileId;
      const photoUrl = photoFileId
        ? await this.filesService.generateUrl(photoFileId.toString(), 60 * 10)
        : null;
      const refreshedAt = wishitem.updatedAt
        ? wishitem.updatedAt
        : wishitem.createdAt;
      return new WishItemPayload({
        id: wishitem.id.toString(),
        folder: wishitem.wishItemFolder?.name ?? null,
        name: wishitem.name,
        price: wishitem.price,
        platform: wishitem.storePlatform,
        brand: wishitem.brand,
        photoUrl,
        productUrl: wishitem.url,
        reason: wishitem.reason,
        refreshedAt,
        addedAt: wishitem.createdAt ?? null,
        updatedAt: wishitem.updatedAt ?? null,
        status: wishitem.status,
      });
    }
  }
  async getWishlistItemInfo(itemId: string, type: string, userId: string) {
    if (!isWishitemType(type))
      throw new BadRequestException(
        "INVALID_INPUT_FORM",
        "유효하지 않은 입력 값 입니다.",
      );
    const wishitem = await this.fetchWishitemDetails(itemId, userId, type);
    return new ShowWishitemDetailResponseDto({
      id: wishitem.id,
      folder: wishitem.folder,
      name: wishitem.name,
      price: wishitem.price,
      platform: wishitem.platform,
      brand: wishitem.brand,
      photoUrl: wishitem.photoUrl,
      productUrl: wishitem.productUrl,
      reason: wishitem.reason,
      refreshedAt: wishitem.refreshedAt,
      addedAt: wishitem.addedAt,
      updatedAt: wishitem.updatedAt,
      status: wishitem.status,
    });
  }
  async getWishlist(data: ShowWishitemListRequestDto) {
    if (!isWishitemStatus(data.status))
      throw new BadRequestException(
        "INVALID_INPUT_FORM",
        "유효하지 않은 입력 값 입니다.",
      );
    const rows: WishlistRecordInterface[] =
      await this.wishlistRepository.findAddedItems(
        data.userId,
        data.take,
        data.status,
        data.cursor,
      );
    const nextCursor =
      rows.length > data.take ? rows[rows.length - 2].cursor : null;
    if (rows.length > data.take) rows.pop();
    const entries = await Promise.all(
      rows.map(async (row) => {
        const url = row.photoFileId
          ? await this.filesService.generateUrl(
              row.photoFileId.toString(),
              60 * 10,
            )
          : null;
        return [row.cursor, url] as const;
      }),
    );
    const photoUrls: Record<string, string | null> =
      Object.fromEntries(entries);
    return new ShowWishitemListResponseDto(rows, nextCursor, photoUrls);
  }
  async getWishitemFolders(data: ShowWishitemFoldersRequestDto) {
    const folders = await this.wishlistRepository.findWishitemFolders({
      where: {
        userId: BigInt(data.userId),
        id: {
          gt: data.cursor ? BigInt(data.cursor) : 0,
        },
      },
      take: data.take + 1,
      orderBy: {
        id: "asc",
      },
    });
    const nextCursor =
      folders.length > data.take
        ? folders[folders.length - 2].id.toString()
        : null;
    if (folders.length > data.take) folders.pop();
    return new ShowWishitemFoldersResponseDto({ folders, nextCursor });
  }
  async addWishitemFolders(data: CreateWishitemFolderRequestDto) {
    const isDuplicateName =
      (
        await this.wishlistRepository.findWishitemFolders({
          where: { userId: BigInt(data.userId), name: data.name },
        })
      ).length !== 0;
    if (isDuplicateName)
      throw new ConflictException(
        "DUPLICATE_FOLDER_NAME",
        "중복되는 폴더 이름은 사용할 수 없습니다.",
      );
    const folder = await this.wishlistRepository.saveWishitemFolder(
      data.userId,
      data.name,
    );
    return new CreateWishitemFolderResponseDto(folder.id.toString());
  }
  async removeWishitemFolder(data: DeleteWishitemFolderRequestDto) {
    const folder = await this.wishlistRepository.findWishitemFolders({
      where: { id: BigInt(data.folderId) },
    });
    const isExist = folder.length !== 0;
    const hasPermission = folder[0]?.userId === BigInt(data.userId);
    if (!isExist || !hasPermission)
      throw new NotFoundException(
        "FOLDER_NOT_FOUND",
        "폴더를 찾을 수 없습니다.",
      );
    await this.dbRepository.transaction(async (tx) => {
      await this.wishlistRepository.updateAddedItemAuto(
        {
          where: { folderId: BigInt(data.folderId) },
          data: {
            folderId: null,
          },
        },
        tx,
      );
      await this.wishlistRepository.updateAddedItemManual(
        {
          where: { folderId: BigInt(data.folderId) },
          data: {
            folderId: null,
          },
        },
        tx,
      );
      return await this.wishlistRepository.deleteWishitemFolder(
        data.folderId,
        tx,
      );
    });
  }
  async setWishitemFolder(
    data: ChangeWishitemFolderLocationRequestDto,
    itemId: string,
    userId: string,
  ) {
    if (!/^\d+$/.exec(itemId))
      throw new BadRequestException(
        "INVALID_ITEM_ID",
        "유효하지 않은 아이템 ID 입니다.",
      );
    if (!isWishitemType(data.type))
      throw new BadRequestException(
        "INVALID_TYPE",
        "유효하지 않은 아이템 타입 입니다.",
      );
    const item =
      data.type === "AUTO"
        ? await this.wishlistRepository.findAddedItemAutoById(itemId)
        : await this.wishlistRepository.findAddedItemManualById(itemId);
    const isExistItem = item !== null;
    const hasPermissionItem = item?.userId === BigInt(userId);
    if (!isExistItem || !hasPermissionItem)
      throw new NotFoundException(
        "WISHITEM_NOT_FOUND",
        "대상 위시 아이템을 찾을 수 없습니다.",
      );
    if (data.folderId) {
      const folder = await this.wishlistRepository.findWishitemFolders({
        where: { id: BigInt(data.folderId) },
      });
      const isExistFolder = folder.length !== 0;
      const hasPermissionFolder = folder[0]?.userId === BigInt(userId);
      if (!isExistFolder || !hasPermissionFolder)
        throw new NotFoundException(
          "WISHITEM_FOLDER_NOT_FOUND",
          "대상 위시 아이템 폴더를 찾을 수 없습니다.",
        );
    }
    data.type === "AUTO"
      ? await this.wishlistRepository.updateAddedItemAuto({
          where: { id: BigInt(itemId) },
          data: {
            folderId: data.folderId ? BigInt(data.folderId) : null,
          },
        })
      : await this.wishlistRepository.updateAddedItemManual({
          where: { id: BigInt(itemId) },
          data: { folderId: data.folderId ? BigInt(data.folderId) : null },
        });
  }
  async markWishitemAsPurchased(
    data: MarkItemAsPurchasedRequestDto,
    itemId: string,
    userId: string,
  ) {
    if (!isWishitemType(data.type))
      throw new BadRequestException(
        "INVALID_TYPE",
        "올바른 아이템 타입을 입력해 주세요.",
      );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(data.date);
    inputDate.setHours(0, 0, 0, 0);
    if (inputDate > today)
      throw new BadRequestException(
        "INVALID_DATE",
        "현재보다 미래 시점을 구매 일자로 설정할 수 없습니다.",
      );
    const item =
      data.type === "AUTO"
        ? await this.wishlistRepository.findAddedItemAutoById(itemId)
        : await this.wishlistRepository.findAddedItemManualById(itemId);
    const isExistItem = item !== null;
    const hasPermission = item?.userId === BigInt(userId);
    const alreadyBought = item?.status === "BOUGHT";
    if (!isExistItem || !hasPermission)
      throw new NotFoundException(
        "WISHITEM_NOT_FOUND",
        "대상 위시 아이템을 찾을 수 없습니다.",
      );
    if (alreadyBought)
      throw new ConflictException(
        "ALREADY_PURCHASED",
        "이미 구매 확정된 위시 아이템 입니다.",
      );
    if ((!data.reason && !data.reasonId) || (data.reason && data.reasonId))
      throw new BadRequestException(
        "INVALID_REASON",
        "이유 템플릿 ID 또는 이유 값중 하나가 입력되어 있어야 합니다.",
      );
    await this.dbRepository.transaction(async (tx) => {
      await this.wishlistRepository.savePurchasedHistory(
        {
          ...(data.type === "AUTO" && {
            addedItemAuto: { connect: { id: BigInt(itemId) } },
          }),
          ...(data.type === "MANUAL" && {
            addedItemManual: { connect: { id: BigInt(itemId) } },
          }),
          ...(data.reasonId && {
            purchasedReason: { connect: { id: +data.reasonId } },
          }),
          ...(data.reason && { reason: data.reason }),
          purchasedDate: new Date(data.date + "T00:00:00+09:00"),
          purchasedAt: data.purchasedAt,
        },
        tx,
      );
      data.type === "AUTO"
        ? await this.wishlistRepository.updateAddedItemAuto(
            {
              where: { id: BigInt(itemId) },
              data: {
                status: "BOUGHT",
              },
            },
            tx,
          )
        : await this.wishlistRepository.updateAddedItemManual(
            {
              where: { id: BigInt(itemId) },
              data: { status: "BOUGHT" },
            },
            tx,
          );
    });
  }
  async markWishitemAsDropped(data: MarkItemAsDroppedRequestDto) {
    if (!isWishitemType(data.type))
      throw new BadRequestException(
        "INVALID_TYPE",
        "올바른 아이템 타입을 입력해 주세요.",
      );
    const item =
      data.type === "AUTO"
        ? await this.wishlistRepository.findAddedItemAutoById(data.itemId)
        : await this.wishlistRepository.findAddedItemManualById(data.itemId);
    const isExist = item !== null;
    const hasPermission = item?.userId === BigInt(data.userId);
    const alreadyDropped = item?.status === "DROPPED";
    if (!isExist || !hasPermission)
      throw new NotFoundException(
        "WISHITEM_NOT_FOUND",
        "대상 위시 아이템을 찾을 수 없습니다.",
      );
    if (alreadyDropped)
      throw new ConflictException(
        "ALREADY_DROPPED",
        "이미 구매 포기된 위시 아이템 입니다.",
      );
    await this.dbRepository.transaction(async (tx) => {
      if (data.type === "AUTO") {
        await this.wishlistRepository.updateAddedItemAuto(
          {
            where: { id: BigInt(data.itemId) },
            data: { status: "DROPPED" },
          },
          tx,
        );
        const result = await this.wishlistRepository.findPurchasedHistories(
          {
            where: { autoItemId: BigInt(data.itemId) },
          },
          tx,
        );
        if (result.length !== 0)
          await this.wishlistRepository.deletePurchasedHistory(
            {
              where: { id: result[0].id },
            },
            tx,
          );
      } else {
        await this.wishlistRepository.updateAddedItemManual(
          {
            where: { id: BigInt(data.itemId) },
            data: { status: "DROPPED" },
          },
          tx,
        );
        const result = await this.wishlistRepository.findPurchasedHistories(
          {
            where: { manualItemId: BigInt(data.itemId) },
          },
          tx,
        );
        if (result.length !== 0)
          await this.wishlistRepository.deletePurchasedHistory(
            { where: { id: result[0].id } },
            tx,
          );
      }
    });
  }
  async deleteWishitem(data: DeleteItemRequestDto) {
    if (!isWishitemType(data.type))
      throw new BadRequestException(
        "INVALID_TYPE",
        "올바른 아이템 타입을 입력해 주세요.",
      );
    const item =
      data.type === "AUTO"
        ? await this.wishlistRepository.findAddedItemAutoById(data.itemId)
        : await this.wishlistRepository.findAddedItemManualById(data.itemId);
    const isExist = item !== null;
    const hasPermission = item?.userId === BigInt(data.userId);
    if (!isExist || !hasPermission)
      throw new NotFoundException(
        "WISHITEM_NOT_FOUND",
        "대상 위시 아이템을 찾을 수 없습니다.",
      );
    await this.dbRepository.transaction(async (tx) => {
      if (data.type === "AUTO") {
        const result = await this.wishlistRepository.findPurchasedHistories(
          {
            where: {
              autoItemId: BigInt(data.itemId),
            },
          },
          tx,
        );
        if (result.length !== 0)
          await this.wishlistRepository.deletePurchasedHistory(
            {
              where: { id: result[0].id },
            },
            tx,
          );
        // TODO : 이 사이에 후기 도 삭제하는 코드 추가하기
        await this.wishlistRepository.deleteAddedItemAuto(
          {
            where: {
              id: BigInt(data.itemId),
            },
          },
          tx,
        );
      } else {
        const result = await this.wishlistRepository.findPurchasedHistories({
          where: {
            manualItemId: BigInt(data.itemId),
          },
        });
        if (result.length !== 0)
          await this.wishlistRepository.deletePurchasedHistory(
            {
              where: { id: result[0].id },
            },
            tx,
          );
        await this.historiesService.deleteReviewsByItem(
          data.itemId,
          data.type as WishitemType,
          tx,
        );
        await this.wishlistRepository.deleteAddedItemManual(
          {
            where: {
              id: BigInt(data.itemId),
            },
          },
          tx,
        );
      }
    });
  }
  async getWishitemsInFolder(data: ShowWishitemsInFolderRequestDto) {
    const folder = await this.wishlistRepository.findWishitemFolders({
      where: { id: BigInt(data.folderId) },
    });
    const isExistFolder = folder.length !== 0;
    const hasPermission = folder[0].userId === BigInt(data.userId);
    if (!isExistFolder || !hasPermission)
      throw new NotFoundException(
        "FOLDER_NOT_FOUND",
        "해당 ID를 가진 폴더를 찾을 수 없습니다.",
      );
    const rows: WishlistRecordInterface[] =
      await this.wishlistRepository.findAddedItems(
        data.userId,
        data.take,
        "WISHLISTED",
        data.cursor,
        data.folderId,
      );
    const nextCursor =
      rows.length > data.take ? rows[rows.length - 2].cursor : null;
    if (rows.length > data.take) rows.pop();
    const entries = await Promise.all(
      rows.map(async (row) => {
        const url = row.photoFileId
          ? await this.filesService.generateUrl(
              row.photoFileId.toString(),
              60 * 10,
            )
          : null;
        return [row.cursor, url] as const;
      }),
    );
    const photoUrls: Record<string, string | null> =
      Object.fromEntries(entries);
    return new ShowWishitemsInFolderResponseDto(rows, nextCursor, photoUrls);
  }
  async setWishitemReason(data: ModifyWishitemReasonRequestDto) {
    if (!isWishitemType(data.type))
      throw new BadRequestException(
        "INVALID_TYPE",
        "올바른 아이템 타입을 입력해 주세요.",
      );
    const item =
      data.type === "AUTO"
        ? await this.wishlistRepository.findAddedItemAutoById(data.itemId)
        : await this.wishlistRepository.findAddedItemManualById(data.itemId);
    const isExist = item !== null;
    const hasPermission = item?.userId === BigInt(data.userId);
    if (!isExist || !hasPermission)
      throw new NotFoundException(
        "WISHITEM_NOT_FOUND",
        "대상 위시 아이템을 찾을 수 없습니다.",
      );
    data.type === "AUTO"
      ? await this.wishlistRepository.updateAddedItemAuto({
          where: { id: BigInt(data.itemId) },
          data: { reason: data.reason },
        })
      : await this.wishlistRepository.updateAddedItemManual({
          where: { id: BigInt(data.itemId) },
          data: { reason: data.reason },
        });
  }
  async updateWishitemInfo(
    itemId: string,
    userId: string,
    body: ModifyWishitemRequestDto,
    file?: Express.Multer.File,
  ) {
    const item = await this.wishlistRepository.findAddedItemManualById(itemId, {
      select: {
        id: true,
        userId: true,
        photoFileId: true,
        files: {
          select: {
            name: true,
          },
        },
      },
    });
    const isExist = item !== null;
    const hasPermission = item?.userId === BigInt(userId);
    if (!isExist || !hasPermission)
      throw new NotFoundException(
        "WISHITEM_NOT_FOUND",
        "대상 위시 아이템을 찾을 수 없습니다.",
      );
    const newFileName = uuid();
    let fileUploadedPayload: FilePayload | null = null;
    let updated = false;
    try {
      if (file) {
        fileUploadedPayload = await this.filesService.upload(
          file,
          newFileName,
          FileTypeEnum.MANUAL_ADDED_PRODUCT_PHOTO,
        );
      }
      let url: URL | undefined = undefined;
      let cleanUrl: string | undefined = undefined;
      if (body.url) {
        try {
          url = new URL(body.url);
          cleanUrl = url.origin + url.pathname.replace(/\/$/, "");
        } catch {
          throw new BadRequestException(
            "INVALID_URL",
            "유효하지 않은 URL 형식입니다.",
          );
        }
        const itemWithSameUrl = await this.wishlistRepository.findAddedItems(
          userId,
          1,
          undefined,
          undefined,
          undefined,
          cleanUrl,
        );
        if (
          itemWithSameUrl.length > 0 &&
          itemWithSameUrl[0].id.toString() !== itemId
        ) {
          throw new ConflictException(
            "DUPLICATE_URL",
            "이미 동일한 URL이 등록된 위시 아이템이 존재합니다.",
          );
        }
      }
      const updateData = {
        ...(body.productName && { name: body.productName }),
        ...(body.price !== undefined && { price: body.price }),
        ...(cleanUrl && { url: cleanUrl }),
        ...(body.storeName && { storePlatform: body.storeName }),
        ...(fileUploadedPayload && {
          photoFileId: BigInt(fileUploadedPayload.id),
        }),
      };
      if (Object.keys(updateData).length === 0)
        throw new BadRequestException(
          "INVALID_INPUT_FORM",
          "수정할 항목이 없습니다.",
        );
      await this.wishlistRepository.updateAddedItemManual({
        data: updateData,
        where: {
          id: BigInt(itemId),
        },
      });
      updated = true;
      if (fileUploadedPayload && item.photoFileId && item.files && file) {
        try {
          await this.filesService.delete(
            item.files!.name,
            FileTypeEnum.MANUAL_ADDED_PRODUCT_PHOTO,
          );
        } catch {
          console.error(
            `S3 파일 삭제 실패 (${item.files!.name} | ${FileTypeEnum.MANUAL_ADDED_PRODUCT_PHOTO})`,
          );
        }
      }
    } catch (e) {
      if (fileUploadedPayload && !updated) {
        const ext = file ? path.extname(file.originalname).toLowerCase() : "";
        await this.filesService.delete(
          `${newFileName}${ext}`,
          FileTypeEnum.MANUAL_ADDED_PRODUCT_PHOTO,
        );
      }
      throw e;
    }
    const result = await this.fetchWishitemDetails(itemId, userId, "MANUAL");
    return new ModifyWishitemResponseDto(result);
  }
}
