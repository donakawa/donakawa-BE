import { AttendanceRepository } from "../repository/attendance.repository";
import { AttendanceResponseDto } from "../dto/response/attendance.response.dto";
import { StreakUtil } from "../util/streak.util";
import { RewardPolicy } from "../policy/reward.policy";

export class AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  // 출석 정보 조회
  async getAttendance(
    userId: string,
    year?: number,
    month?: number,
  ): Promise<AttendanceResponseDto> {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth() + 1;
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    // 출석 데이터 조회
    const attendances = await this.attendanceRepository.findAttendancesByMonth(
      userId,
      startDate,
      endDate,
    );
    const attendanceDates = attendances.map(
      (a) => a.attendedDate.toISOString().split("T")[0],
    );

    // 보상 데이터 조회
    const claimedRewards = await this.attendanceRepository.findClaimedRewards(
      userId,
      targetYear,
      targetMonth,
    );
    const unclaimedAttendances =
      await this.attendanceRepository.findUnclaimedAttendances(userId);

    // 오늘 출석 여부 판단
    const todayString = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    const todayAttended = attendanceDates.includes(todayString);

    // 최장 연속 출석 일수 계산
    const maxStreak = StreakUtil.calculateMaxStreak(attendanceDates);

    // 보상 상태 계산
    const rewards = RewardPolicy.buildRewards(maxStreak, claimedRewards);

    // 보상 수령 가능 여부 판단
    const canClaimReward = RewardPolicy.canClaimReward(
      rewards,
      unclaimedAttendances.length > 0,
    );

    return new AttendanceResponseDto({
      year: targetYear,
      month: targetMonth,
      attendanceDates,
      attendanceCount: attendanceDates.length,
      todayAttended,
      canClaimReward,
      rewards,
    });
  }
}
