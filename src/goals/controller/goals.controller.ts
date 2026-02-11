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
  Query,
  Middlewares,
} from "tsoa";
import { AppError } from "../../errors/app.error";
import { ApiResponse, success } from "../../common/response";
import { Request as ExpressRequest } from "express";
import {
  GoalsRequestDto,
  GoalsUpdateRequestDto,
  CalcShoppingBudgetRequestDto,
} from "../dto/request/goals.request.dto";
import {
  GoalsResponseDto,
  BudgetSpendResponseDto,
  CalcShoppingBudgetResponseDto,
  SpendSummaryResponseDto,
} from "../dto/response/goals.response.dto";
import { GoalsService } from "../service/goals.service";
import { container } from "../../container";
import { validateBody } from "../../middleware/validation.middleware";

@Route("/goals")
@Tags("Goals")
@Security("jwt")
export class GoalsController {
  private readonly goalsService: GoalsService = container.goals.service;

  /**
   * @summary 온라인 쇼핑 목표액 계산 API
   */
  @Post("/budget/calculate")
  @Middlewares(validateBody(CalcShoppingBudgetRequestDto))
  @SuccessResponse("200", "온라인 쇼핑 목표액 계산 성공")
  public async calcShoppingBudget(
    @Body() body: CalcShoppingBudgetRequestDto,
  ): Promise<ApiResponse<CalcShoppingBudgetResponseDto>> {
    const data = await this.goalsService.calcShoppingBudget(body);

    return success(data);
  }

  /**
   * @summary 목표 예산 설정 API
   */
  @Post("/budget")
  @Middlewares(validateBody(GoalsRequestDto))
  @SuccessResponse("201", "목표 예산 설정 성공")
  public async createTargetBudget(
    @Body() body: GoalsRequestDto,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<GoalsResponseDto>> {
    const userId = req.user!.id;
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
    const userId = req.user!.id;
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
    const userId = req.user!.id;
    const data = await this.goalsService.updateTargetBudget(userId, body);

    return success(data);
  }

  /**
   * @summary 소비, 남은 예산 값 조회 API
   */
  @Get("/spend")
  @SuccessResponse("200", "소비, 남은 예산 값 조회 성공")
  public async getBudgetSpend(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<BudgetSpendResponseDto>> {
    const userId = req.user!.id;
    const data = await this.goalsService.getBudgetSpend(userId);

    return success(data);
  }

  /**
   * @summary 만족 소비 조회 API
   */
  @Get("/spend/satisfied")
  @SuccessResponse("200", "만족 소비 조회 성공")
  public async getSatisfiedSpend(
    @Request() req: ExpressRequest,
    @Query() cursor?: string,
  ): Promise<ApiResponse<SpendSummaryResponseDto>> {
    const userId = req.user!.id;
    const data = await this.goalsService.getSatisfiedSpend(userId, cursor);

    return success(data);
  }

  /**
   * @summary 후회 소비 조회 API
   */
  @Get("/spend/regret")
  @SuccessResponse("200", "후회 소비 조회 성공")
  public async getRegretSpend(
    @Request() req: ExpressRequest,
    @Query() cursor?: string,
  ): Promise<ApiResponse<SpendSummaryResponseDto>> {
    const userId = req.user!.id;
    const data = await this.goalsService.getRegretSpend(userId, cursor);

    return success(data);
  }
}
