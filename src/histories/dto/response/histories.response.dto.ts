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

export interface CalendarSummaryDto {
  totalAmount: number;
  purchaseCount: number;
}

export interface CalendarDayDto {
  date: string; // yyyy-MM-dd
  purchaseCount: number;
  totalAmount: number;
}

export interface CalendarItemDto {
  itemId: number;
  itemType: "AUTO" | "MANUAL";
  name: string;
  price: number;
  thumbnailUrl: string | null;
  purchasedAt: "MORNING" | "EVENING" | "NIGHT";
  satisfaction: number | null;
}

export interface MonthlyCalendarResponseDto {
  year: number;
  month: number;
  summary: CalendarSummaryDto;
  calendar: CalendarDayDto[];
  itemsByDate: Record<string, CalendarItemDto[]>;
}