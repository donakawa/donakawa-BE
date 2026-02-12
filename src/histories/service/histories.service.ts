import { HistoriesRepository } from "../repository/histories.repository";
import { FilesService } from "../../files/service/files.service";
import { AppError } from "../../errors/app.error";
import {
  MonthlyCalendarResponseDto,
  GetDailyHistoriesResponseDto,
  GetHistoryItemsResponseDto,
  HistoryItemDto,
  MonthlyReportResponseDto,
  AnalyticsResponseDto,
  AiCommentResponseDto,
} from "../dto/response/histories.response.dto";
import {
  ReviewStatus,
  AnalyticsMetric,
} from "../dto/request/histories.request.dto";
import { Prisma } from "@prisma/client";
import { AiCommentService } from "./aicomment.sevice";

export class HistoriesService {
  constructor(
    private readonly historiesRepository: HistoriesRepository,
    private readonly filesService: FilesService,
    private readonly aiCommentService: AiCommentService,
  ) { }

  async createReview(
    userId: bigint,
    itemId: bigint,
    itemType: "AUTO" | "MANUAL",
    satisfaction: number,
    frequency: number,
  ) {
    if (itemType === "AUTO") {
      const autoItem = await this.historiesRepository.findAutoItem(
        itemId,
        userId,
      );

      if (!autoItem) {
        throw new AppError({
          errorCode: "H002",
          message: "해당 AUTO 아이템을 찾을 수 없습니다.",
          statusCode: 404,
        });
      }

      return this.historiesRepository.createReview({
        autoItemId: itemId,
        satisfaction,
        frequency,
      });
    }

    // MANUAL
    const manualItem = await this.historiesRepository.findManualItem(
      itemId,
      userId,
    );

    if (!manualItem) {
      throw new AppError({
        errorCode: "H002",
        message: "해당 MANUAL 아이템을 찾을 수 없습니다.",
        statusCode: 404,
      });
    }

    return this.historiesRepository.createReview({
      manualItemId: itemId,
      satisfaction,
      frequency,
    });
  }

  async getMyReviews(userId: bigint) {
    const reviews = await this.historiesRepository.findMyReviews(userId);
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

    const mapped = await Promise.all(
      reviews.map(async (review) => {
        // AUTO ITEM
        if (review.addedItemAuto) {
          const item = review.addedItemAuto;
          const product = item.product;
          const purchased = item.purchasedHistory[0];

          const purchaseReasons = purchased?.purchasedReason
            ? [purchased.purchasedReason.reason]
            : purchased?.reason
              ? purchased.reason.split(",")
              : [];

          const imageUrl = await this.getItemImageUrl(item.id, "AUTO");

          return {
            reviewId: Number(review.id),
            itemId: Number(item.id),
            itemName: product.name,
            price: product.price,
            imageUrl,
            purchaseReasons,
            satisfactionScore: review.satisfaction ?? 0,
            purchasedAt: purchased
              ? (() => {
                const kstDate = new Date(
                  purchased.purchasedDate.getTime() + KST_OFFSET_MS,
                );
                return `${kstDate.getUTCFullYear()}-${String(
                  kstDate.getUTCMonth() + 1,
                ).padStart(
                  2,
                  "0",
                )}-${String(kstDate.getUTCDate()).padStart(2, "0")}`;
              })()
              : "",
          };
        }

        // MANUAL ITEM
        const item = review.addedItemManual!;
        const purchased = item.purchasedHistory[0];

        const purchaseReasons = purchased?.purchasedReason
          ? [purchased.purchasedReason.reason]
          : purchased?.reason
            ? purchased.reason.split(",")
            : [];

        const imageUrl = await this.getItemImageUrl(item.id, "MANUAL");

        return {
          reviewId: Number(review.id),
          itemId: Number(item.id),
          itemName: item.name,
          price: item.price,
          imageUrl,
          purchaseReasons: purchaseReasons,
          satisfactionScore: review.satisfaction ?? 0,
          purchasedAt: purchased
            ? (() => {
              const kstDate = new Date(
                purchased.purchasedDate.getTime() + KST_OFFSET_MS,
              );
              return `${kstDate.getUTCFullYear()}-${String(
                kstDate.getUTCMonth() + 1,
              ).padStart(
                2,
                "0",
              )}-${String(kstDate.getUTCDate()).padStart(2, "0")}`;
            })()
            : "",
        };
      }),
    );

    return {
      reviewCount: mapped.length,
      reviews: mapped,
    };
  }

  async getMonthlyCalendar(
    userId: bigint,
    year: number,
    month: number,
  ): Promise<MonthlyCalendarResponseDto> {
    if (month < 1 || month > 12) {
      throw new AppError({
        errorCode: "H003",
        message: "month는 1~12 범위여야 합니다.",
        statusCode: 400,
      });
    }

    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

    const start = new Date(Date.UTC(year, month - 1, 1) - KST_OFFSET_MS);
    const end = new Date(Date.UTC(year, month, 1) - KST_OFFSET_MS);

    const histories = await this.historiesRepository.findMonthlyPurchasedItems(
      userId,
      start,
      end,
    );

    const itemsByDate: Record<string, any[]> = {};
    let totalAmount = 0;

    for (const h of histories) {
      const utcDate = h.purchasedDate;
      const kstDate = new Date(utcDate.getTime() + KST_OFFSET_MS);

      const date = `${kstDate.getUTCFullYear()}-${String(
        kstDate.getUTCMonth() + 1,
      ).padStart(2, "0")}-${String(kstDate.getUTCDate()).padStart(2, "0")}`;

      if (!itemsByDate[date]) {
        itemsByDate[date] = [];
      }

      if (h.addedItemAuto) {
        const item = h.addedItemAuto;
        const price = item.product.price;
        const review = item.review[0];

        totalAmount += price;

        const thumbnailUrl = await this.getItemImageUrl(item.id, "AUTO");

        itemsByDate[date].push({
          itemId: Number(item.id),
          itemType: "AUTO",
          name: item.product.name,
          price,
          thumbnailUrl,
          purchasedAt: h.purchasedAt,
          satisfaction: review?.satisfaction ?? null,
        });
      }

      if (h.addedItemManual) {
        const item = h.addedItemManual;
        const price = item.price;
        const review = item.review[0];

        totalAmount += price;

        const thumbnailUrl = await this.getItemImageUrl(item.id, "MANUAL");

        itemsByDate[date].push({
          itemId: Number(item.id),
          itemType: "MANUAL",
          name: item.name,
          price,
          thumbnailUrl,
          purchasedAt: h.purchasedAt,
          satisfaction: review?.satisfaction ?? null,
        });
      }
    }

    const calendar = Object.entries(itemsByDate).map(([date, items]) => ({
      date,
      purchaseCount: items.length,
      totalAmount: items.reduce((sum, i) => sum + i.price, 0),
    }));

    return {
      year,
      month,
      summary: {
        totalAmount,
        purchaseCount: histories.length,
      },
      calendar,
      itemsByDate,
    };
  }

  async getDailyHistories(
    userId: bigint,
    date: string,
  ): Promise<GetDailyHistoriesResponseDto> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError({
        errorCode: "H004",
        message: "날짜 형식이 올바르지 않습니다.",
        statusCode: 400,
      });
    }

    const [y, m, d] = date.split("-").map(Number);
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

    const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - KST_OFFSET_MS);

    const end = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0) - KST_OFFSET_MS);

    const validationDate = new Date(Date.UTC(y, m - 1, d));
    if (
      Number.isNaN(validationDate.getTime()) ||
      validationDate.getUTCFullYear() !== y ||
      validationDate.getUTCMonth() !== m - 1 ||
      validationDate.getUTCDate() !== d
    ) {
      throw new AppError({
        errorCode: "H004",
        message: "날짜 형식이 올바르지 않습니다.",
        statusCode: 400,
      });
    }

    const histories = await this.historiesRepository.findDailyPurchasedItems(
      userId,
      start,
      end,
    );

    const items = await Promise.all(
      histories.map(async (h) => {
        if (h.addedItemAuto) {
          const item = h.addedItemAuto;
          const review = item.review[0];
          const price = item.product.price;

          const thumbnailUrl = await this.getItemImageUrl(item.id, "AUTO");

          return {
            itemId: Number(item.id),
            itemType: "AUTO" as const,
            name: item.product.name,
            price,
            thumbnailUrl,
            purchasedAt: h.purchasedAt,
            satisfaction: review?.satisfaction ?? null,
          };
        }

        const item = h.addedItemManual!;
        const review = item.review[0];
        const price = item.price;

        const thumbnailUrl = await this.getItemImageUrl(item.id, "MANUAL");

        return {
          itemId: Number(item.id),
          itemType: "MANUAL" as const,
          name: item.name,
          price,
          thumbnailUrl,
          purchasedAt: h.purchasedAt,
          satisfaction: review?.satisfaction ?? null,
        };
      }),
    );

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    return {
      date,
      summary: {
        totalAmount,
        purchaseCount: items.length,
      },
      items,
    };
  }

  async deleteReviewsByItem(
    itemId: string,
    itemType: "AUTO" | "MANUAL",
    tx?: Prisma.TransactionClient,
  ): Promise<{ deletedCount: number }> {
    const result = await this.historiesRepository.deleteReviewsByItem({
      itemId,
      itemType,
      tx,
    });

    return {
      deletedCount: result.count,
    };
  }

  async getHistoryItems(
    userId: bigint,
    reviewStatus: ReviewStatus = "ALL",
  ): Promise<GetHistoryItemsResponseDto> {
    const histories = await this.historiesRepository.findHistoryItems(
      userId,
      reviewStatus,
    );

    const items: HistoryItemDto[] = await Promise.all(
      histories.map(async (h) => {
        const date = h.purchasedDate.toISOString().split("T")[0];

        const purchaseReasons = h.purchasedReason
          ? [h.purchasedReason.reason]
          : h.reason
            ? h.reason.split(",")
            : [];

        if (h.addedItemAuto) {
          const item = h.addedItemAuto;
          const review = item.review[0];

          const imageUrl = await this.getItemImageUrl(item.id, "AUTO");

          return {
            reviewId: review ? Number(review.id) : undefined,
            itemId: Number(item.id),
            itemName: item.product.name,
            price: item.product.price,
            imageUrl,
            purchaseReasons,
            purchasedAt: date,
          };
        }

        const item = h.addedItemManual!;
        const review = item.review[0];

        const imageUrl = await this.getItemImageUrl(item.id, "MANUAL");

        return {
          reviewId: review ? Number(review.id) : undefined,
          itemId: Number(item.id),
          itemName: item.name,
          price: item.price,
          imageUrl,
          purchaseReasons,
          purchasedAt: date,
        };
      }),
    );

    return { items };
  }

  async getRecentMonthReport(
    userId: bigint,
  ): Promise<MonthlyReportResponseDto> {
    const to = new Date();
    to.setUTCHours(23, 59, 59, 999);
    const from = new Date(to);
    from.setUTCDate(to.getUTCDate() - 29);
    from.setUTCHours(0, 0, 0, 0);

    const histories = await this.historiesRepository.findRecentMonthHistories(
      userId,
      from,
      to,
    );

    let totalSpent = 0;
    let satisfactionSum = 0;
    let satisfactionCount = 0;

    const reasonMap: Record<
      string,
      { count: number; satisfactionSum: number; satisfactionCount: number }
    > = {};

    histories.forEach((h) => {
      const reason = h.purchasedReason?.reason;
      const reasons = reason ? [reason] : [];
      let price = 0;
      let satisfaction: number | null = null;

      if (h.addedItemAuto) {
        const item = h.addedItemAuto;
        const review = item.review[0];

        price = item.product.price;
        satisfaction = review?.satisfaction ?? null;
      }

      if (h.addedItemManual) {
        const item = h.addedItemManual;
        const review = item.review[0];

        price = item.price;
        satisfaction = review?.satisfaction ?? null;
      }

      totalSpent += price;

      if (satisfaction !== null) {
        satisfactionSum += satisfaction;
        satisfactionCount++;
      }

      reasons.forEach((reason) => {
        if (!reasonMap[reason]) {
          reasonMap[reason] = {
            count: 0,
            satisfactionSum: 0,
            satisfactionCount: 0,
          };
        }

        reasonMap[reason].count++;

        if (satisfaction !== null) {
          reasonMap[reason].satisfactionSum += satisfaction;
          reasonMap[reason].satisfactionCount++;
        }
      });
    });

    const topReasons = Object.entries(reasonMap)
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        averageSatisfaction:
          data.satisfactionCount === 0
            ? 0
            : Number(
              (data.satisfactionSum / data.satisfactionCount).toFixed(1),
            ),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      period: {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
        days: 30,
      },
      summary: {
        totalSpent,
        savedAmount: Math.floor(totalSpent * 0.1),
        averageSatisfaction:
          satisfactionCount === 0
            ? 0
            : Number((satisfactionSum / satisfactionCount).toFixed(1)),
      },
      topReasons,
    };
  }

  public async getAnalytics(
    userId: bigint,
    metric: AnalyticsMetric,
  ): Promise<AnalyticsResponseDto> {
    const histories = await this.historiesRepository.findAllByUser(userId);

    const totalCount = histories.length;

    if (totalCount === 0) {
      return {
        metric: metric === "time" ? "TIME" : "DAY",
        totalCount: 0,
        statistics: [],
      };
    }

    return metric === "time"
      ? this.buildTimeAnalytics(histories, totalCount)
      : this.buildDayAnalytics(histories, totalCount);
  }

  // 시간대 통계
  private buildTimeAnalytics(
    histories: any[],
    totalCount: number,
  ): AnalyticsResponseDto {
    const labels = [
      { key: "MORNING", name: "아침" },
      { key: "EVENING", name: "저녁" },
      { key: "NIGHT", name: "새벽" },
    ];

    const countMap: Record<string, number> = {
      MORNING: 0,
      EVENING: 0,
      NIGHT: 0,
    };

    histories.forEach((h) => {
      countMap[h.purchasedAt]++;
    });

    return {
      metric: "TIME",
      totalCount,
      statistics: labels.map((l) => ({
        label: l.key,
        displayName: l.name,
        count: countMap[l.key],
        percentage: Math.round((countMap[l.key] / totalCount) * 100),
      })),
    };
  }

  // 요일 통계
  private buildDayAnalytics(
    histories: any[],
    totalCount: number,
  ): AnalyticsResponseDto {
    const labels = [
      { key: "SUN", name: "일" },
      { key: "MON", name: "월" },
      { key: "TUE", name: "화" },
      { key: "WED", name: "수" },
      { key: "THU", name: "목" },
      { key: "FRI", name: "금" },
      { key: "SAT", name: "토" },
    ];

    const countMap: Record<string, number> = {
      SUN: 0,
      MON: 0,
      TUE: 0,
      WED: 0,
      THU: 0,
      FRI: 0,
      SAT: 0,
    };

    histories.forEach((h) => {
      const kstDate = new Date(
        h.purchasedDate.getTime() + 9 * 60 * 60 * 1000
      );

      const dayIndex = kstDate.getUTCDay();
      const label = labels[dayIndex].key;
      countMap[label]++;
    });

    return {
      metric: "DAY",
      totalCount,
      statistics: labels.map((l) => ({
        label: l.key,
        displayName: l.name,
        count: countMap[l.key],
        percentage: Math.round((countMap[l.key] / totalCount) * 100),
      })),
    };
  }

  async getItemImageUrl(
    itemId: bigint,
    itemType: "AUTO" | "MANUAL",
  ): Promise<string | null> {
    const photoFileId = await this.historiesRepository.findItemPhotoFileId(
      itemId,
      itemType,
    );

    if (!photoFileId) return null;

    return this.filesService.generateUrl(photoFileId.toString(), 60 * 60);
  }

  public async getAiComment(userId: bigint): Promise<AiCommentResponseDto> {
    // userId를 string으로 변환해서 GptService 호출
    const result = await this.aiCommentService.getAiComment(userId.toString());
    return result;
  }
}
