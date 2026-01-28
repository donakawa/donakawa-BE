import {
  Body,
  Path,
  Post,
  Get,
  Route,
  Tags,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { container } from "../../container";
import { ApiResponse, success } from "../../common/response";
import { CreateReviewRequestDto } from "../dto/request/histories.request.dto";
import { CreateReviewResponseDto, GetMyReviewsResponseDto } from "../dto/response/histories.response.dto";
import { HistoriesService } from "../service/histories.service";

@Route("/histories")
@Tags("Histories")
export class HistoriesController {
  private readonly historiesService: HistoriesService =
    container.histories.service;

  @Security("jwt")
  @Post("/items/{itemId}/review")
  public async createReview(
    @Path() itemId: number,
    @Body() body: CreateReviewRequestDto,
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<CreateReviewResponseDto>> {
    const userId = Number(req.user!.id);

    const review = await this.historiesService.createReview(
      userId,
      itemId,
      body.satisfaction,
      body.frequency
    );

    return success(CreateReviewResponseDto.from(review));
  }

  @Security("jwt")
  @Get("/reviews")
  public async getMyReviews(
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<GetMyReviewsResponseDto>> {
    const userId = Number(req.user!.id);

    const result = await this.historiesService.getMyReviews(userId);
    return success(result);
  }
}