import { GoalsRepository } from "../repository/goals.repository";
import { GoalsRequestDto } from "../dto/request/goals.request.dto";
import { GoalsResponseDto } from "../dto/response/goals.response.dto";
import { ConflictException } from "../../errors/error";

export class GoalsService {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  private makeNextIncomeDate(day: number): Date {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    const today = now.getDate();

    if (day <= today) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    let target = new Date(Date.UTC(year, month, day, 0, 0, 0));
    target = new Date(target.getTime() + 9 * 60 * 60 * 1000);

    return target;
  }

  async createTargetBudget(
    userId: bigint,
    body: GoalsRequestDto,
  ): Promise<GoalsResponseDto> {
    const isExist = await this.goalsRepository.findByUserId(userId);
    if (isExist) {
      throw new ConflictException(
        "B001",
        "이미 목표 예산이 등록되어 있습니다.",
      );
    }

    const incomeDay = body.incomeDate ?? 1;
    const { incomeDate: _, ...rest } = body;
    const nextIncomeDate = this.makeNextIncomeDate(incomeDay);

    const saved = await this.goalsRepository.createTargetBudget(userId, {
      ...rest,
      incomeDate: nextIncomeDate,
    });

    return new GoalsResponseDto(saved);
  }
}
