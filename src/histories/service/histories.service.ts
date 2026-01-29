import { HistoriesRepository } from "../repository/histories.repository";
import { AppError } from "../../errors/app.error";
import { MonthlyCalendarResponseDto } from "../dto/response/histories.response.dto";

export class HistoriesService {
  constructor(private readonly historiesRepository: HistoriesRepository) {}

  async createReview(
    userId: bigint,
    itemId: number,
    satisfaction: number,
    frequency: number
  ) {
    const autoItem = await this.historiesRepository.findAutoItem(
      itemId,
      userId
    );

    if (autoItem) {
      return this.historiesRepository.createReview({
        autoItemId: itemId,
        satisfaction,
        frequency,
      });
    }

    const manualItem = await this.historiesRepository.findManualItem(
      itemId,
      userId
    );

    if (manualItem) {
      return this.historiesRepository.createReview({
        manualItemId: itemId,
        satisfaction,
        frequency,
      });
    }

    throw new AppError({
      errorCode: "H002",
      message: "해당 아이템을 찾을 수 없습니다.",
      statusCode: 404,
    });
  }

  async getMyReviews(userId: bigint) {
    const reviews = await this.historiesRepository.findMyReviews(userId);

    const mapped = reviews.map((review) => {
      // AUTO ITEM
      if (review.addedItemAuto) {
        const item = review.addedItemAuto;
        const product = item.product;
        const purchased = item.purchasedHistory[0];

        return {
          reviewId: Number(review.id),
          itemId: Number(item.id),
          itemName: product.name,
          price: product.price,
          imageUrl: null, // 현재 product에 이미지 없음
          purchaseReasons: item.reason ? item.reason.split(",") : [],
          satisfactionScore: review.satisfaction ?? 0,
          purchasedAt: purchased
            ? purchased.purchasedDate.toISOString().split("T")[0]
            : "",
        };
      }

      // MANUAL ITEM
      const item = review.addedItemManual!;
      const purchased = item.purchasedHistory[0];

      return {
        reviewId: Number(review.id),
        itemId: Number(item.id),
        itemName: item.name,
        price: item.price,
        imageUrl: null,
        purchaseReasons: item.reason ? item.reason.split(",") : [],
        satisfactionScore: review.satisfaction ?? 0,
        purchasedAt: purchased
          ? purchased.purchasedDate.toISOString().split("T")[0]
          : "",
      };
    });

    return {
      reviewCount: mapped.length,
      reviews: mapped,
    };
  }

  async getMonthlyCalendar(
    userId: bigint,
    year: number,
    month: number
  ): Promise<MonthlyCalendarResponseDto> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const histories =
      await this.historiesRepository.findMonthlyPurchasedItems(
        userId,
        start,
        end
      );

    const itemsByDate: Record<string, any[]> = {};
    let totalAmount = 0;

    histories.forEach((h) => {
      const date = h.purchasedDate.toISOString().split("T")[0];

      if (!itemsByDate[date]) {
        itemsByDate[date] = [];
      }

      if (h.addedItemAuto) {
        const item = h.addedItemAuto;
        const price = item.product.price;
        const review = item.review[0];

        totalAmount += price;

        itemsByDate[date].push({
          itemId: Number(item.id),
          itemType: "AUTO",
          name: item.product.name,
          price,
          thumbnailUrl: null,
          purchasedAt: h.purchasedAt,
          satisfaction: review?.satisfaction ?? null,
        });
      }

      if (h.addedItemManual) {
        const item = h.addedItemManual;
        const price = item.price;
        const review = item.review[0];

        totalAmount += price;

        itemsByDate[date].push({
          itemId: Number(item.id),
          itemType: "MANUAL",
          name: item.name,
          price,
          thumbnailUrl: null,
          purchasedAt: h.purchasedAt,
          satisfaction: review?.satisfaction ?? null,
        });
      }
    });

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
}