export interface CreateReviewRequestDto {
  itemType: "AUTO" | "MANUAL";
  satisfaction: number;
  frequency: number;
}

export interface GetMonthlyCalendarRequestDto {
  year: number;
  month: number; // 1~12
}

export interface GetDailyHistoriesRequestDto {
  date: string; // YYYY-MM-DD
}

export type ReviewStatus = "ALL" | "WRITTEN" | "NOT_WRITTEN";

export interface GetHistoryItemsRequestDto {
  reviewStatus?: ReviewStatus; // 기본값 ALL
}

export type AnalyticsMetric = "time" | "day";