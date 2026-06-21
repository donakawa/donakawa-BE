import { Prisma, PrismaClient, Attendance } from "@prisma/client";

export class AttendanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // 출석 조회 (월 단위)
  async findAttendancesByMonth(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.attendance.findMany({
      where: {
        userId: BigInt(userId),
        attendedDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        attendedDate: "asc",
      },
    });
  }

  // 수령한 보상 조회
  async findClaimedRewards(userId: string, year: number, month: number) {
    return this.prisma.attendanceReward.findMany({
      where: {
        userId: BigInt(userId),
        year,
        month,
      },
    });
  }

  // 미수령한 출석 조회
  async findUnclaimedAttendances(userId: string) {
    return this.prisma.attendance.findMany({
      where: {
        userId: BigInt(userId),
        claimed: false,
      },
    });
  }

  // 오늘 출석 여부 조회
  async findAttendanceByDate(userId: string, attendedDate: Date) {
    return this.prisma.attendance.findFirst({
      where: {
        userId: BigInt(userId),
        attendedDate,
      },
    });
  }

  // 출석
  async createAttendance(userId: string, attendedDate: Date) {
    return this.prisma.attendance.create({
      data: {
        userId: BigInt(userId),
        attendedDate,
      },
    });
  }

  // 포인트 수령, 연속 출석 일수 보상 저장
  async claimReward(
    userId: string,
    coin: number,
    attendanceIds: bigint[],
    streakRewards: {
      streakDays: number;
      coin: number;
    }[],
    year: number,
    month: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: BigInt(userId),
        },
        data: {
          coin: {
            increment: coin,
          },
        },
      });

      if (attendanceIds.length > 0) {
        await tx.attendance.updateMany({
          where: {
            id: {
              in: attendanceIds,
            },
          },
          data: {
            claimed: true,
          },
        });
      }

      if (streakRewards.length > 0) {
        await tx.attendanceReward.createMany({
          data: streakRewards.map((reward) => ({
            userId: BigInt(userId),
            year,
            month,
            streakDays: reward.streakDays,
            rewardCoin: reward.coin,
          })),
        });
      }
    });
  }
}
