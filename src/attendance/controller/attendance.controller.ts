import {
  Body,
  Example,
  Response,
  Get,
  Post,
  Patch,
  Put,
  Route,
  SuccessResponse,
  Tags,
  Security,
  Request,
  Query,
  Queries,
  Middlewares,
} from "tsoa";
import { AppError } from "../../errors/app.error";
import { ApiResponse, success } from "../../common/response";
import { Request as ExpressRequest } from "express";
import { AttendanceQueryDto } from "../dto/request/attendance.request.dto";
import { AttendanceResponseDto } from "../dto/response/attendance.response.dto";
import { AttendanceService } from "../service/attendance.service";
import { container } from "../../container";

@Route("/attendance")
@Tags("Attendance")
@Security("jwt")
export class AttendanceController {
  private readonly attendanceService: AttendanceService =
    container.attendance.service;

  /**
   * @summary 출첵 화면 조회 API
   */
  @Get()
  @SuccessResponse("200", "출첵 화면 조회 성공")
  public async getAttendance(
    @Request() req: ExpressRequest,
    @Queries() query: AttendanceQueryDto,
  ): Promise<ApiResponse<AttendanceResponseDto>> {
    const userId = req.user!.id;
    const data = await this.attendanceService.getAttendance(
      userId,
      query.year,
      query.month,
    );

    return success(data);
  }
}
