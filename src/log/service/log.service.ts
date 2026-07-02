import { LogRepository } from './../repository/log.repository';
import { ApiResponse } from "../../common/response";
import { CalendarItem, CalendarProduct, CreateGoalResponse, GetCalendarResponse, GetGoalManagementResponse, GetLogMainResponse } from "../dto/response/log.response.dto";
import { LOG_CONVERSION } from "../constant/log.constant";
import { GoalStatus } from '@prisma/client';
import { CreateGoalRequest, GetCalendarRequest, UpdateGoalStatusRequest } from '../dto/request/log.request.dto';
import { AppError } from '../../errors/app.error';

export class LogService {
  constructor(private logRepository: LogRepository) { }

  public async getLogMain(
    userId: string,
  ): Promise<GetLogMainResponse> {
    const [
      summary,
      last3months,
      dayOfWeek,
      rate,
    ] = await Promise.all([
      this.getSummary(userId),
      this.getLast3Months(userId),
      this.getDayOfWeek(userId),
      this.getRate(userId),
    ]);

    return {
      summary,
      last3months,
      dayOfWeek,
      rate,
    };
  }

  private async getSummary(
    userId: string,
  ): Promise<GetLogMainResponse["summary"]> {
    const [
      user,
      goal,
      autoDroppedItems,
      manualDroppedItems,
    ] = await Promise.all([
      this.logRepository.findUser(userId),
      this.logRepository.findInProgressGoal(userId),
      this.logRepository.getDroppedAutoItems(userId),
      this.logRepository.getDroppedManualItems(userId),
    ]);

    const totalSavings =
      autoDroppedItems.reduce(
        (sum, item) => sum + item.product.price,
        0,
      ) +
      manualDroppedItems.reduce(
        (sum, item) => sum + item.price,
        0,
      );

    const today = new Date();

    const diffDays = Math.floor(
      (today.getTime() - user!.createdAt.getTime()) /
      (1000 * 60 * 60 * 24),
    );

    const period =
      diffDays >= 30
        ? Math.floor(diffDays / 30)
        : 0;

    return {
      since: user!.createdAt
        .toISOString()
        .split("T")[0],

      period,

      totalSavings,

      inProgress: goal
        ? {
          title: goal.title,
          moneyGoal: Number(goal.moneyGoal),
          current: Number(goal.current),

          percent: Math.floor(
            (Number(goal.current) /
              Number(goal.moneyGoal)) *
            100,
          ),

          needed:
            Number(goal.moneyGoal) -
            Number(goal.current),
        }
        : null,
    };
  }

  private async getLast3Months(
    userId: string,
  ): Promise<
    GetLogMainResponse["last3months"]
  > {
    const startDate = new Date();

    startDate.setMonth(
      startDate.getMonth() - 3,
    );

    const [
      autoDroppedItems,
      manualDroppedItems,
    ] = await Promise.all([
      this.logRepository.getDroppedAutoItemsLast3Months(
        userId,
        startDate,
      ),
      this.logRepository.getDroppedManualItemsLast3Months(
        userId,
        startDate,
      ),
    ]);

    const number =
      autoDroppedItems.length +
      manualDroppedItems.length;

    const savings =
      autoDroppedItems.reduce(
        (sum, item) => sum + item.product.price,
        0,
      ) +
      manualDroppedItems.reduce(
        (sum, item) => sum + item.price,
        0,
      );

    return {
      number,
      savings,

      coffee: Math.floor(
        savings /
        LOG_CONVERSION.COFFEE_PRICE,
      ),

      minimumWage: Math.floor(
        savings /
        LOG_CONVERSION.MINIMUM_WAGE,
      ),

      chicken: Math.floor(
        savings /
        LOG_CONVERSION.CHICKEN_PRICE,
      ),
    };
  }

  private async getDayOfWeek(
    userId: string,
  ): Promise<
    GetLogMainResponse["dayOfWeek"]
  > {
    const [
      wishlistedDates,
      boughtDates,
      droppedDates,
    ] = await Promise.all([
      this.logRepository.getWishlistedDates(
        userId,
      ),
      this.logRepository.getBoughtDates(
        userId,
      ),
      this.logRepository.getDroppedDates(
        userId,
      ),
    ]);

    return {
      WISHLISTED:
        this.getMostFrequentDay([
          ...wishlistedDates.autoItems.map(
            (item) => item.createdAt,
          ),
          ...wishlistedDates.manualItems.map(
            (item) => item.createdAt,
          ),
        ]),

      BOUGHT: this.getMostFrequentDay(
        boughtDates.map(
          (item) => item.purchasedDate,
        ),
      ),

      DROPPED:
        this.getMostFrequentDay([
          ...droppedDates.autoItems
            .map((item) => item.updatedAt)
            .filter(Boolean),

          ...droppedDates.manualItems
            .map((item) => item.updatedAt)
            .filter(Boolean),
        ] as Date[]),
    };
  }

  private async getRate(
    userId: string,
  ): Promise<
    GetLogMainResponse["rate"]
  > {
    const counts =
      await this.logRepository.getItemStatusCounts(
        userId,
      );

    if (counts.total === 0) {
      return {
        BOUGHT: 0,
        DROPPED: 0,
      };
    }

    return {
      BOUGHT: Math.floor(
        ((counts.bought /
          counts.total) *
          100) / 10
      ) * 10,

      DROPPED: Math.floor(
        ((counts.dropped /
          counts.total) *
          100) / 10
      ) * 10
    };
  }

  private getMostFrequentDay(
    dates: Date[],
  ): string {
    if (dates.length === 0) {
      return "NONE";
    }

    const dayNames = [
      "SUN",
      "MON",
      "TUE",
      "WED",
      "THU",
      "FRI",
      "SAT",
    ];

    const stats = new Map<
      string,
      {
        count: number;
        latestDate: Date;
      }
    >();

    dates.forEach((date) => {
      const day = dayNames[date.getDay()];

      const existing = stats.get(day);

      if (!existing) {
        stats.set(day, {
          count: 1,
          latestDate: date,
        });

        return;
      }

      stats.set(day, {
        count: existing.count + 1,
        latestDate:
          date > existing.latestDate
            ? date
            : existing.latestDate,
      });
    });

    return [...stats.entries()]
      .sort((a, b) => {
        const countDiff =
          b[1].count - a[1].count;

        if (countDiff !== 0) {
          return countDiff;
        }

        return (
          b[1].latestDate.getTime() -
          a[1].latestDate.getTime()
        );
      })[0][0];
  }

  public async createGoal(
    userId: string,
    request: CreateGoalRequest,
  ): Promise<CreateGoalResponse> {
    const {
      title,
      moneyGoal,
      current,
    } = request;

    if (!title.trim()) {
      throw new AppError({
        errorCode: "L002",
        message: "목표 제목은 비어 있을 수 없습니다.",
        statusCode: 400
      });
    }

    if (current < 0) {
      throw new AppError({
        errorCode: "L003",
        message: "현재 금액은 음수일 수 없습니다.",
        statusCode: 400
      });
    }

    if (moneyGoal <= 0) {
      throw new AppError({
        errorCode: "L004",
        message: "목표 금액은 0원 이하일 수 없습니다.",
        statusCode: 400
      });
    }

    if (current > moneyGoal) {
      throw new AppError({
        errorCode: "L005",
        message: "현재 금액이 목표 금액보다 클 수 없습니다.",
        statusCode: 400
      });
    }

    const inProgressGoal =
      await this.logRepository.findInProgressGoal(
        userId,
      );

    if (inProgressGoal) {
      throw new AppError({
        errorCode: "L006",
        message: "현재 진행 중인 목표가 있습니다.",
        statusCode: 400
      });
    }

    const isCompleted =
      current >= moneyGoal;

    const goal =
      await this.logRepository.createGoal({
        userId,
        title,
        moneyGoal,
        current,
        status: isCompleted
          ? GoalStatus.COMPLETED
          : GoalStatus.IN_PROGRESS,
        endedAt: isCompleted
          ? new Date()
          : null,
      });

    return {
      id: goal.id,
      title: goal.title,
      moneyGoal: Number(goal.moneyGoal),
      current: Number(goal.current),
      status: goal.status,
      createdAt: goal.createdAt
        .toISOString()
        .split("T")[0],
      endedAt: goal.endedAt
        ? goal.endedAt
          .toISOString()
          .split("T")[0]
        : null,
    };
  }

  public async updateGoalStatus(
    userId: string,
    request: UpdateGoalStatusRequest,
  ): Promise<void> {
    const goal =
      await this.logRepository.findGoalById(
        request.id,
      );

    if (!goal) {
      throw new AppError({
        errorCode: "L001",
        message: "존재하지 않는 목표입니다.",
        statusCode: 404,
      });
    }

    if (goal.userId !== BigInt(userId)) {
      throw new AppError({
        errorCode: "L001",
        message: "존재하지 않는 목표입니다.",
        statusCode: 404,
      });
    }

    if (
      goal.status === GoalStatus.STOPPED ||
      goal.status === GoalStatus.COMPLETED
    ) {
      throw new AppError({
        errorCode: "L007",
        message: "이미 종료된 목표입니다.",
        statusCode: 400,
      });
    }

    await this.logRepository.updateGoalStatus(
      request.id,
      request.changeStateTo === "COMPLETED"
        ? GoalStatus.COMPLETED
        : GoalStatus.STOPPED,
    );
  }

  public async getGoalManagement(
    userId: string,
  ): Promise<GetGoalManagementResponse> {
    const [
      inProgressGoal,
      pastGoals,
    ] = await Promise.all([
      this.logRepository.findInProgressGoal(
        userId,
      ),
      this.logRepository.findPastGoals(
        userId,
      ),
    ]);

    return {
      inProgress: inProgressGoal
        ? {
          id: inProgressGoal.id,
          title: inProgressGoal.title,
          moneyGoal: Number(
            inProgressGoal.moneyGoal,
          ),
          current: Number(
            inProgressGoal.current,
          ),
          percent: Math.floor(
            Number(inProgressGoal.current) /
            Number(
              inProgressGoal.moneyGoal,
            ) *
            100,
          ),
          needed:
            Number(
              inProgressGoal.moneyGoal,
            ) -
            Number(
              inProgressGoal.current,
            ),
        }
        : null,

      past: pastGoals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        moneyGoal: Number(goal.moneyGoal),
        state: goal.status,
        createdAt: goal.createdAt
          .toISOString()
          .split("T")[0],
        endedAt:
          goal.endedAt
            ?.toISOString()
            .split("T")[0] ?? "",
      })),
    };
  }

  public async getCalendar(
    userId: string,
    request: GetCalendarRequest,
  ): Promise<GetCalendarResponse> {
    const { year, month, type } = request;

    if (month < 1 || month > 12) {
      throw new AppError({
        errorCode: "L010",
        message: "유효하지 않은 월입니다.",
        statusCode: 400,
      });
    }

    if (
      type !== "BOUGHT" &&
      type !== "DROPPED"
    ) {
      throw new AppError({
        errorCode: "L011",
        message: "유효하지 않은 타입입니다.",
        statusCode: 400,
      });
    }

    const startDate = new Date(
      year,
      month - 1,
      1,
    );

    const endDate = new Date(
      year,
      month,
      1,
    );

    const calendar =
      type === "BOUGHT"
        ? await this.getBoughtCalendar(
            userId,
            startDate,
            endDate,
          )
        : await this.getDroppedCalendar(
            userId,
            startDate,
            endDate,
          );

    return {
      year,
      month,
      type,
      calendar,
    };
  }

  private async getBoughtCalendar(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarItem[]> {
    const histories =
      await this.logRepository.findBoughtItemsByMonth(
        userId,
        startDate,
        endDate,
      );

    const grouped = new Map<
      string,
      {
        totalAmount: number;
        items: CalendarProduct[];
      }
    >();

    for (const history of histories) {
      const date =
        history.purchasedDate
          .toISOString()
          .split("T")[0];

      let item: CalendarProduct | null =
        null;

      if (history.addedItemAuto) {
        item = {
          name:
            history.addedItemAuto.product
              .name,
          price:
            history.addedItemAuto.product
              .price,
          shop:
            history.addedItemAuto.product
              .storePlatform.name,
        };
      }

      if (history.addedItemManual) {
        item = {
          name:
            history.addedItemManual.name,
          price:
            history.addedItemManual.price,
          shop:
            history.addedItemManual
              .storePlatform,
        };
      }

      if (!item) {
        continue;
      }

      const existing =
        grouped.get(date);

      if (existing) {
        existing.totalAmount +=
          item.price;

        existing.items.push(item);

        continue;
      }

      grouped.set(date, {
        totalAmount: item.price,
        items: [item],
      });
    }

    return Array.from(grouped.entries())
      .map(([date, value]) => ({
        date,
        totalAmount:
          value.totalAmount,
        items: value.items,
      }))
      .sort((a, b) =>
        b.date.localeCompare(b.date),
      );
  }

  private async getDroppedCalendar(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarItem[]> {
    const [
      autoItems,
      manualItems,
    ] = await Promise.all([
      this.logRepository.findDroppedAutoItemsByMonth(
        userId,
        startDate,
        endDate,
      ),
      this.logRepository.findDroppedManualItemsByMonth(
        userId,
        startDate,
        endDate,
      ),
    ]);

    const grouped = new Map<
      string,
      {
        totalAmount: number;
        items: CalendarProduct[];
      }
    >();

    for (const item of autoItems) {
      if (!item.updatedAt) {
        continue;
      }

      const date =
        item.updatedAt
          .toISOString()
          .split("T")[0];

      const product = {
        name: item.product.name,
        price: item.product.price,
        shop:
          item.product
            .storePlatform.name,
      };

      const existing =
        grouped.get(date);

      if (existing) {
        existing.totalAmount +=
          product.price;

        existing.items.push(product);

        continue;
      }

      grouped.set(date, {
        totalAmount: product.price,
        items: [product],
      });
    }

    for (const item of manualItems) {
      if (!item.updatedAt) {
        continue;
      }

      const date =
        item.updatedAt
          .toISOString()
          .split("T")[0];

      const product = {
        name: item.name,
        price: item.price,
        shop: item.storePlatform,
      };

      const existing =
        grouped.get(date);

      if (existing) {
        existing.totalAmount +=
          product.price;

        existing.items.push(product);

        continue;
      }

      grouped.set(date, {
        totalAmount: product.price,
        items: [product],
      });
    }

    return Array.from(grouped.entries())
      .map(([date, value]) => ({
        date,
        totalAmount:
          value.totalAmount,
        items: value.items,
      }))
      .sort((a, b) =>
        b.date.localeCompare(b.date),
      );
  }
}