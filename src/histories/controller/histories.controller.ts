import {
  Body,
  Path,
  Post,
  Get,
  Query,
  Route,
  Tags,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { container } from "../../container";
import { ApiResponse, success } from "../../common/response";
import {
  CreateReviewRequestDto,
  ReviewStatus,
  AnalyticsMetric,
} from "../dto/request/histories.request.dto";
import {
  CreateReviewResponseDto,
  GetMyReviewsResponseDto,
  MonthlyCalendarResponseDto,
  GetDailyHistoriesResponseDto,
  GetHistoryItemsResponseDto,
  MonthlyReportResponseDto,
  AnalyticsResponseDto,
  AiCommentResponseDto,
} from "../dto/response/histories.response.dto";
import { HistoriesService } from "../service/histories.service";
import { AiCommentService } from "../service/aicomment.sevice";

@Route("/histories")
@Tags("Histories")
export class HistoriesController {
  private readonly historiesService: HistoriesService =
    container.histories.service;

  /**
   * @summary 후기 작성 API
   */
  @Security("jwt")
  @Post("/items/{itemId}/review")
  public async createReview(
    @Path() itemId: number,
    @Body() body: CreateReviewRequestDto,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<CreateReviewResponseDto>> {
    const userId = BigInt(req.user!.id);

    const review = await this.historiesService.createReview(
      userId,
      BigInt(itemId),
      body.itemType,
      body.satisfaction,
      body.frequency,
    );

    return success(CreateReviewResponseDto.from(review));
  }

  /**
   * @summary 작성한 후기 목록 조회 API
   */
  @Security("jwt")
  @Get("/reviews")
  public async getMyReviews(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<GetMyReviewsResponseDto>> {
    const userId = BigInt(req.user!.id);

    const result = await this.historiesService.getMyReviews(userId);
    return success(result);
  }

  /**
   * @summary 특정 달의 기록 조회 API
   */
  @Security("jwt")
  @Get("/calendar")
  public async getMonthlyCalendar(
    @Query() year: number,
    @Query() month: number,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<MonthlyCalendarResponseDto>> {
    const userId = BigInt(req.user!.id);

    const result = await this.historiesService.getMonthlyCalendar(
      userId,
      year,
      month,
    );

    return success(result);
  }

  /**
   * @summary 특정 날짜의 후기 조회 API
   */
  @Security("jwt")
  @Get()
  public async getDailyHistories(
    @Query() date: string,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<GetDailyHistoriesResponseDto>> {
    const userId = BigInt(req.user!.id);

    const result = await this.historiesService.getDailyHistories(userId, date);

    return success(result);
  }

  /**
   * @summary 작성하지 않은 후기 목록 조회 API
   */
  @Security("jwt")
  @Get("/items")
  public async getHistoryItems(
    @Query() reviewStatus: ReviewStatus = "ALL",
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<GetHistoryItemsResponseDto>> {
    const userId = BigInt(req.user!.id);

    const result = await this.historiesService.getHistoryItems(
      userId,
      reviewStatus,
    );

    return success(result);
  }

  /**
   * @summary 최근 한 달 리포트 조회 API
   */
  @Security("jwt")
  @Get("/report")
  public async getRecentMonthReport(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<MonthlyReportResponseDto>> {
    const userId = BigInt(req.user!.id);

    const result = await this.historiesService.getRecentMonthReport(userId);

    return success(result);
  }

  /**
   * @summary 요일/시간 통계 조회 API
   */
  @Security("jwt")
  @Get("/analytics")
  public async getAnalytics(
    @Request() req: ExpressRequest,
    @Query() metric: AnalyticsMetric = "time",
  ): Promise<ApiResponse<AnalyticsResponseDto>> {
    const userId = BigInt(req.user!.id);

    const data = await this.historiesService.getAnalytics(userId, metric);

    return success(data);
  }

  /**
   * @summary AI 소비 한줄 평 가져오기
   */
  @Security("jwt")
  @Get("/report/ai-comment")
  public async getAiComment(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<AiCommentResponseDto>> {
    const userId = BigInt(req.user!.id);

    const result = await this.historiesService.getAiComment(userId);
    return success(result);
  }
}
