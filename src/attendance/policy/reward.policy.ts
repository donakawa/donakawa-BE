import { RewardStatusDto } from "../dto/response/attendance.response.dto";

export class RewardPolicy {
  private static readonly milestones = [5, 10, 20, 30];

  // 보상 상태 계산(달성 여부, 수령 여부 확인)
  static buildRewards(
    maxStreak: number,
    claimedRewards: { streakDays: number }[],
  ): RewardStatusDto[] {
    return this.milestones.map((streakDays) => {
      const achieved = maxStreak >= streakDays;
      const claimed = claimedRewards.some((r) => r.streakDays === streakDays);

      return new RewardStatusDto(streakDays, achieved, claimed);
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
