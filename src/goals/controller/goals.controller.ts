import {
  Body,
  Example,
  Response,
  Get,
  Post,
  Patch,
  Route,
  SuccessResponse,
  Tags,
  Security,
  Request,
} from "tsoa";
import { AppError } from "../../errors/app.error";
import { ApiResponse, success } from "../../common/response";
import { Request as ExpressRequest } from "express";
import {
  GoalsRequestDto,
  GoalsUpdateRequestDto,
} from "../dto/request/goals.request.dto";
import { GoalsResponseDto } from "../dto/response/goals.response.dto";
import { container } from "../../container";
import { GoalsService } from "../service/goals.service";

@Route("/goals")
@Tags("Goals")
// @Security("jwt")
export class GoalsController {
  private readonly goalsService: GoalsService = container.goals.service;

  /**
   * @summary 목표 예산 설정 API
   */
  @Post("/budget")
  @SuccessResponse("201", "목표 예산 설정 성공")
  public async createTargetBudget(
    @Body() body: GoalsRequestDto,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<GoalsResponseDto>> {
    // const userId = BigInt((req as any).user.id);
    const userId = BigInt(1);
    const data = await this.goalsService.createTargetBudget(userId, body);

    return success(data);
  }

  /**
   * @summary 목표 예산 조회 API
   */
  @Get("/budget")
  @SuccessResponse("200", "목표 예산 조회 성공")
  public async getTargetBudget(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<GoalsResponseDto | null>> {
    // const userId = BigInt((req as any).user.id);
    const userId = BigInt(1);
    const data = await this.goalsService.getTargetBudget(userId);

    return success(data);
  }

  /**
   * @summary 목표 예산 수정 API
   */
  @Patch("/budget")
  @SuccessResponse("200", "목표 예산 수정 성공")
  public async updateTargetBudget(
    @Body() body: GoalsUpdateRequestDto,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<GoalsResponseDto>> {
    // const userId = BigInt((req as any).user.id);
    const userId = BigInt(1);

    const data = await this.goalsService.updateTargetBudget(userId, body);
    return success(data);
  }
}
