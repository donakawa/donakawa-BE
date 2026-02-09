export class CreateReviewResponseDto {
  reviewId!: number;
  itemId!: number;
  satisfaction!: number;
  frequency!: number;
  updatedAt!: Date | null;

  static from(review: {
    id: bigint;
    satisfaction: number | null;
    frequency: number | null;
    updatedAt: Date | null;
    autoItemId?: bigint | null;
    manualItemId?: bigint | null;
  }): CreateReviewResponseDto {
    return {
      reviewId: Number(review.id),
      itemId: Number(review.autoItemId ?? review.manualItemId),
      satisfaction: review.satisfaction ?? 0,
      frequency: review.frequency ?? 0,
      updatedAt: review.updatedAt,
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

export interface DailyHistoryItemDto {
  itemId: number;
  itemType: "AUTO" | "MANUAL";
  name: string;
  price: number;
  thumbnailUrl: string | null;
  purchasedAt: "MORNING" | "EVENING" | "NIGHT";
  satisfaction: number | null;
}

export interface DailyHistorySummaryDto {
  totalAmount: number;
  purchaseCount: number;
}

export interface GetDailyHistoriesResponseDto {
  date: string;
  summary: DailyHistorySummaryDto;
  items: DailyHistoryItemDto[];
}

export interface HistoryItemDto {
  reviewId?: number;
  itemId: number;
  itemName: string;
  price: number;
  imageUrl: string | null;
  purchaseReasons: string[];
  purchasedAt: string; // yyyy-MM-dd
}

export interface GetHistoryItemsResponseDto {
  items: HistoryItemDto[];
}

export interface ReportPeriodDto {
  from: string; // yyyy-MM-dd
  to: string; // yyyy-MM-dd
  days: number;
}

export interface ReportSummaryDto {
  totalSpent: number;
  savedAmount: number;
  averageSatisfaction: number;
}

export interface ReportReasonDto {
  reason: string;
  count: number;
  averageSatisfaction: number;
}

export interface MonthlyReportResponseDto {
  period: ReportPeriodDto;
  summary: ReportSummaryDto;
  topReasons: ReportReasonDto[];
}

export interface AnalyticsStatistic {
  label: string;
  displayName: string;
  count: number;
  percentage: number;
}

export interface AnalyticsResponseDto {
  metric: "TIME" | "DAY";
  totalCount: number;
  statistics: AnalyticsStatistic[];
}

export interface AiCommentResponseDto {
  comment: string;
  type: "positive" | "negative";
}
