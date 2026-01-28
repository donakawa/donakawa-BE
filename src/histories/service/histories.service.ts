import { HistoriesRepository } from "../repository/histories.repository";
import { AppError } from "../../errors/app.error";

export class HistoriesService {
  constructor(private readonly historiesRepository: HistoriesRepository) {}

  async createReview(
    userId: number,
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

  async getMyReviews(userId: number) {
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
}