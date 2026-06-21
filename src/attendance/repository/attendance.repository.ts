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
}
