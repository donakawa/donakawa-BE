import { GoalsRepository } from "../repository/goals.repository";
import {
  GoalsRequestDto,
  GoalsUpdateRequestDto,
} from "../dto/request/goals.request.dto";
import { GoalsResponseDto } from "../dto/response/goals.response.dto";
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "../../errors/error";

export class GoalsService {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  // 갱신일 계산
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

  // 날짜 범위 검증
  private validateIncomeDate(day: number) {
    if (day < 1 || day > 31) {
      throw new BadRequestException(
        "B002",
        "incomeDate는 1에서 31 사이의 값이어야 합니다.",
      );
    }
  }

  // 목표 예산 등록
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
    this.validateIncomeDate(incomeDay);
    const { incomeDate: _, ...rest } = body;
    const nextIncomeDate = this.makeNextIncomeDate(incomeDay);

    const saved = await this.goalsRepository.createTargetBudget(userId, {
      ...rest,
      incomeDate: nextIncomeDate,
    });

    return new GoalsResponseDto(saved);
  }

  // 목표 예산 조회
  async getTargetBudget(userId: bigint): Promise<GoalsResponseDto | null> {
    const result = await this.goalsRepository.findBudgetByUserId(userId);
    if (!result) {
      throw new NotFoundException("B003", "등록된 목표 예산이 없습니다.");
    }

    return new GoalsResponseDto(result);
  }

  // 목표 예산 수정
  async updateTargetBudget(
    userId: bigint,
    body: GoalsUpdateRequestDto,
  ): Promise<GoalsResponseDto> {
    const isExist = await this.goalsRepository.findBudgetByUserId(userId);
    if (!isExist) {
      throw new NotFoundException("B003", "등록된 목표 예산이 없습니다.");
    }

    let nextIncomeDate = isExist.incomeDate;
    if (body.incomeDate !== undefined) {
      this.validateIncomeDate(body.incomeDate);
      nextIncomeDate = this.makeNextIncomeDate(body.incomeDate);
    }

    const updated = await this.goalsRepository.updateTargetBudget(isExist.id, {
      ...body,
      incomeDate: nextIncomeDate,
    });

    return new GoalsResponseDto(updated);
  }
}
