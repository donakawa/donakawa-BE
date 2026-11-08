import { container } from "../../container";
import { Controller, Get, Route, Request, Security, Tags, Post, Body, Patch, SuccessResponse, Queries } from "tsoa";
import { Request as ExpressRequest } from "express";
import { ApiResponse, success } from "../../common/response";
import { LogService } from "../service/log.service";
import {
  CreateGoalResponse,
  GetCalendarResponse,
  GetGoalManagementResponse,
  GetLogMainResponse
} from "../dto/response/log.response.dto";
import { CreateGoalRequest, GetCalendarRequest, UpdateGoalStatusRequest } from "../dto/request/log.request.dto";

@Route("log")
@Tags("Log")
export class LogController extends Controller {
  private readonly logService: LogService = container.log.service;

  /**
   * @summary 로그 메인 조회
   */
  @Get("/")
  @Security("jwt")
  public async getLogMain(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<GetLogMainResponse>> {
    const result = await this.logService.getLogMain(req.user!.id);

    return success(result);
  }

  /**
   * @summary 새 목표 설정
   */
  @Post("/goal")
  @Security("jwt")
  public async createGoal(
    @Request() req: ExpressRequest,
    @Body() request: CreateGoalRequest,
  ): Promise<
    ApiResponse<CreateGoalResponse>
  > {
    const result =
      await this.logService.createGoal(
        req.user!.id,
        request,
      );

    return success(result);
  }

  /**
   * @summary 목표 중단/달성
   * @description 진행 중인 목표를 중단하거나 달성 상태로 바꿉니다.
   */
  @Patch("/goal")
  @Security("jwt")
  @SuccessResponse(204, "No Content")
  public async updateGoalStatus(
    @Request() req: ExpressRequest,
    @Body()
    request: UpdateGoalStatusRequest,
  ): Promise<void> {
    await this.logService.updateGoalStatus(
      req.user!.id,
      request,
    );

    this.setStatus(204);
  }

  /**
   * @summary 목표 관리 조회
   * @description 사용자의 모든 목표를 가져옵니다.
   */
  @Get("/goal")
  @Security("jwt")
  public async getGoalManagement(
    @Request() req: ExpressRequest,
  ): Promise<
    ApiResponse<GetGoalManagementResponse>
  > {
    const result =
      await this.logService.getGoalManagement(
        req.user!.id,
      );

    return success(result);
  }

  /**
   * @summary 로그 캘린더 조회
   */
  @Get("/calendar")
  @Security("jwt")
  public async getCalendar(
    @Request() req: ExpressRequest,

    @Queries()
    request: GetCalendarRequest,
  ): Promise<
    ApiResponse<GetCalendarResponse>
  > {
    const result =
      await this.logService.getCalendar(
        req.user!.id,
        request,
      );

    return success(result);
  }
}