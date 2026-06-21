import { Attendance } from "@prisma/client";

export class RewardStatusDto {
  streakDays!: number;
  achieved!: boolean;
  claimed!: boolean;

  constructor(streakDays: number, achieved: boolean, claimed: boolean) {
    this.streakDays = streakDays;
    this.achieved = achieved;
    this.claimed = claimed;
  }
}

export interface AttendanceInfo {
  year: number;
  month: number;
  attendanceDates: string[];
  attendanceCount: number;
  todayAttended?: boolean;
  canClaimReward?: boolean;
  rewards: RewardStatusDto[];
}

export class AttendanceResponseDto {
  readonly year: number;
  readonly month: number;
  readonly attendanceDates: string[];
  readonly attendanceCount: number;
  readonly todayAttended?: boolean;
  readonly canClaimReward?: boolean;
  readonly rewards: RewardStatusDto[];

  constructor(entity: AttendanceInfo) {
    this.year = entity.year;
    this.month = entity.month;
    this.attendanceDates = entity.attendanceDates;
    this.attendanceCount = entity.attendanceCount;
    this.todayAttended = entity.todayAttended;
    this.canClaimReward = entity.canClaimReward;
    this.rewards = entity.rewards;
  }
}

export interface ClaimRewardInfo {
  totalRewardCoin: number;
}

export class ClaimRewardResponseDto {
  readonly totalRewardCoin: number;

  constructor(entity: ClaimRewardInfo) {
    this.totalRewardCoin = entity.totalRewardCoin;
  }
}
