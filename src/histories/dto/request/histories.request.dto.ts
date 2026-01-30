export interface CreateReviewRequestDto {
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