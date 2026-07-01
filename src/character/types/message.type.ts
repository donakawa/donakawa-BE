import { MessageId } from "../enums/message-id.enum";

export interface TalkCandidate {
  id: MessageId;
  priority: number;
  message: string;
}

export interface MessageData {
  user: any;
  goal: any;
  budget: any;
  currentSpend: number;
  remainingBudget: number;
  skippedPurchase: {
    price: number;
    updatedAt: Date;
  } | null;
  showGoalWelcome: boolean;
  showGoalMonthlyWelcome: boolean;
  lastLoginAt: Date | null;
  showLoginGreeting: boolean;
}
