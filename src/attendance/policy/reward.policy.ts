import { RewardStatusDto } from "../dto/response/attendance.response.dto";
import { ATTENDANCE_REWARDS } from "../constants/attendance.constant";

export class RewardPolicy {
  // 보상 상태 계산(달성 여부, 수령 여부 확인)
  static buildRewards(
    maxStreak: number,
    claimedRewards: { streakDays: number }[],
  ): RewardStatusDto[] {
    return ATTENDANCE_REWARDS.map((reward) => {
      const achieved = maxStreak >= reward.streakDays;
      const claimed = claimedRewards.some(
        (r) => r.streakDays === reward.streakDays,
      );

      return new RewardStatusDto(reward.streakDays, achieved, claimed);
    });
  }

  // 보상 수령 가능 여부 판단(미수령 여부 확인)
  static canClaimReward(
    rewards: RewardStatusDto[],
    hasUnclaimedAttendance: boolean,
  ): boolean {
    const canClaimStreakReward = rewards.some((r) => r.achieved && !r.claimed);

    return hasUnclaimedAttendance || canClaimStreakReward;
  }
}
