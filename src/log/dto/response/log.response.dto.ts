export interface GetLogMainResponse {
  summary: {
    since: string;
    period: number;
    totalSavings: number;

    inProgress: {
      title: string;
      moneyGoal: number;
      current: number;
      percent: number;
      needed: number;
    } | null;
  };

  last3months: {
    number: number;
    savings: number;
    coffee: number;
    minimumWage: number;
    chicken: number;
  };

  dayOfWeek: {
    WISHLISTED: string;
    BOUGHT: string;
    DROPPED: string;
  };

  rate: {
    BOUGHT: number;
    DROPPED: number;
  };
}

export interface CreateGoalResponse {
  id: number;
  title: string;
  moneyGoal: number;
  current: number;
  status: "IN_PROGRESS" | "COMPLETED" | "STOPPED";
  createdAt: string;
  endedAt: string | null;
}

export interface GetGoalManagementResponse {
  inProgress: {
    id: number;
    title: string;
    moneyGoal: number;
    current: number;
    percent: number;
    needed: number;
  } | null;

  past: {
    id: number;
    title: string;
    moneyGoal: number;
    state: string;
    createdAt: string;
    endedAt: string;
  }[];
}

export interface GetCalendarResponse {
  year: number;
  month: number;
  type: "BOUGHT" | "DROPPED";
  calendar: CalendarItem[];
}

export interface CalendarItem {
  date: string;
  totalAmount: number;
  items: CalendarProduct[];
}

export interface CalendarProduct {
  name: string;
  price: number;
  shop: string;
}