export class CreateReviewResponseDto {
  reviewId!: number;
  itemId!: number;
  satisfaction!: number;
  frequency!: number;
  createdAt!: Date;

  static from(review: {
    id: bigint;
    satisfaction: number | null;
    frequency: number | null;
    createdAt: Date;
    autoItemId?: bigint | null;
    manualItemId?: bigint | null;
  }): CreateReviewResponseDto {
    return {
      reviewId: Number(review.id),
      itemId: Number(review.autoItemId ?? review.manualItemId),
      satisfaction: review.satisfaction ?? 0,
      frequency: review.frequency ?? 0,
      createdAt: review.createdAt,
    };
  }
}

export class ReviewItemResponseDto {
  reviewId!: number;
  itemId!: number;
  itemName!: string;
  price!: number;
  imageUrl!: string | null;
  purchaseReasons!: string[];
  satisfactionScore!: number;
  purchasedAt!: string;
}

export class GetMyReviewsResponseDto {
  reviewCount!: number;
  reviews!: ReviewItemResponseDto[];
}