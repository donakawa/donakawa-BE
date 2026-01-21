import {
  Body,
  Example,
  Response,
  Get,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Security,
  Request,
} from "tsoa";
import { AppError } from "../../errors/app.error";
import { ApiResponse, success } from "../../common/response";
import { Request as ExpressRequest } from "express";
import { GoalsRequestDto } from "../dto/request/goals.request.dto";
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
}
