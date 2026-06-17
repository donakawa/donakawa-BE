export interface CreateGoalRequest {
  title: string;
  moneyGoal: number;
  current: number;
}

export interface UpdateGoalStatusRequest {
  id: number;
  changeStateTo: "COMPLETED" | "STOPPED";
}

export interface GetCalendarRequest {
  year: number;
  month: number;
  type: "BOUGHT" | "DROPPED";
}