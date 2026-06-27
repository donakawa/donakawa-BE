import { MessageId } from "../enums/message-id.enum";
import { TALK_MESSAGES } from "../constants/message.constant";
import { TalkCandidate } from "../types/message.type";
import { MessageData } from "../types/message.type";

export class MessagePolicy {
  static select(data: MessageData): TalkCandidate {
    const candidates: TalkCandidate[] = [];

    this.addGreeting(candidates, data);
    this.addBudget(candidates, data);
    this.addGoal(candidates, data);
    this.addSave(candidates, data);

    console.log(candidates);
    return candidates.sort((a, b) => b.priority - a.priority)[0];
  }

  // 일상
  private static addGreeting(candidates: TalkCandidate[], data: MessageData) {
    if (this.isReconnect(data)) {
      candidates.push(this.create(MessageId.TALK_01));
      return;
    }

    candidates.push(
      this.create(MessageId.TALK_02, {
        USER_NAME: data.user.nickname,
      }),
    );
  }

  // 미접속 판단
  private static isReconnect(data: MessageData): boolean {
    if (!data.lastLoginAt) {
      // 첫 로그인
      return false;
    }

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const lastLogin = new Date(data.lastLoginAt);
    lastLogin.setUTCHours(0, 0, 0, 0);

    const diffDays =
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);

    return diffDays >= 3;
  }

  // 예산
  private static addBudget(candidates: TalkCandidate[], data: MessageData) {
    if (!data.budget || data.budget.shoppingBudget == null) {
      candidates.push(this.create(MessageId.BUD_01));
      return;
    }

    const shoppingBudget = data.budget.shoppingBudget ?? 0;
    if (shoppingBudget <= 0) {
      return;
    }

    if (data.currentSpend > shoppingBudget) {
      candidates.push(this.create(MessageId.BUD_03));
      return;
    }

    if (data.currentSpend >= shoppingBudget * 0.8) {
      candidates.push(this.create(MessageId.BUD_02));
    }
  }

  // 모으기 목표
  private static addGoal(candidates: TalkCandidate[], data: MessageData) {
    if (!data.goal) {
      return;
    }

    console.log(data.goal);

    const achievementRate = Math.floor(
      (Number(data.goal.current) / Number(data.goal.moneyGoal)) * 100,
    );

    if (data.showGoalWelcome) {
      candidates.push(
        this.create(MessageId.GOAL_01, {
          GOAL_NAME: data.goal.title,
        }),
      );
    }

    if (achievementRate >= 80) {
      candidates.push(
        this.create(MessageId.GOAL_03, {
          GOAL_NAME: data.goal.title,
        }),
      );
    }

    if (data.showGoalMonthlyWelcome) {
      candidates.push(
        this.create(MessageId.GOAL_02, {
          GOAL_NAME: data.goal.title,
          DIFF: achievementRate, // 수정 필요
        }),
      );
    }
  }

  // 구매 포기
  private static addSave(candidates: TalkCandidate[], data: MessageData) {
    if (!data.skippedPurchase) {
      return;
    }

    const price = data.skippedPurchase.price;

    if (price >= 20000) {
      candidates.push(
        this.create(MessageId.SAVE_02, {
          PRICE: Math.floor(price / 20000),
        }),
      );
    }

    if (price >= 10000) {
      candidates.push(this.create(MessageId.SAVE_03));
    }

    if (price >= 5000) {
      candidates.push(this.create(MessageId.SAVE_01));
    }
  }

  static create(
    id: MessageId,
    variables?: Record<string, string | number>,
  ): TalkCandidate {
    let message: string = TALK_MESSAGES[id].message;

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, String(value));
      });
    }

    return {
      id,
      priority: TALK_MESSAGES[id].priority,
      message,
    };
  }
}
