import { AttendanceRepository } from "../repository/attendance.repository";
import { AttendanceResponseDto } from "../dto/response/attendance.response.dto";
import { StreakUtil } from "../util/streak.util";
import { RewardPolicy } from "../policy/reward.policy";
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "../../errors/error";

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
    if ((year === undefined) !== (month === undefined)) {
      throw new BadRequestException("A001", "잘못된 입력입니다.");
    }
    if (
      targetMonth < 1 ||
      targetMonth > 12 ||
      targetYear < 2000 ||
      targetYear > 2100
    ) {
      throw new BadRequestException("A001", "잘못된 입력입니다.");
    }

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (
      targetYear > currentYear ||
      (targetYear === currentYear && targetMonth > currentMonth)
    ) {
      throw new BadRequestException("A002", "출석 정보를 조회할 수 없습니다.");
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);
    const isCurrentMonth =
      targetYear === now.getFullYear() && targetMonth === now.getMonth() + 1;

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
      rewards,

      ...(isCurrentMonth && {
        todayAttended,
        canClaimReward,
      }),
    });
  }

  // 출석
  async attend(userId: string): Promise<void> {
    const now = new Date();
    const attendedDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const attendance = await this.attendanceRepository.findAttendanceByDate(
      userId,
      attendedDate,
    );

    if (attendance) {
      throw new ConflictException("A003", "이미 출석한 날짜입니다.");
    }

    await this.attendanceRepository.createAttendance(userId, attendedDate);
  }
}
