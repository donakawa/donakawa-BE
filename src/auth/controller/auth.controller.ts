import {
  Body,
  Example,
  Get,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Request,
} from "tsoa";
import { AppError } from "../../errors/app.error";
import { ApiResponse, success } from "../../common/response";
import {
  HelloResponseDto,
  LoginResponseDto,
  RegisterResponseDto,
} from "../dto/response/auth.response.dto";
import { AuthService } from "../service/auth.service";
import { container } from "../../container";
import {
  LoginRequestDto,
  RegisterRequestDto,
} from "../dto/request/auth.request.dto";
import { JwtCookieUtil } from "../util/jwt-cookie.util";
import { Request as ExpressRequest } from "express";

@Route("/auth")
@Tags("Auth")
export class AuthController {
  private readonly authService: AuthService = container.auth.service;
  @Get("/hello")
  public hello(): ApiResponse<HelloResponseDto> {
    return success(HelloResponseDto.from(this.authService.hello()));
  }
  @Get("/hello-fail")
  public helloFail(): ApiResponse<HelloResponseDto> {
    throw new AppError({
      errorCode: "D001",
      message: "테스트 에러",
      statusCode: 400,
    });
  }
  @Post("/login")
  public async login(
    @Body() body: LoginRequestDto,
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<LoginResponseDto>> {
    const { data, tokens } = await this.authService.authUser(body);
    JwtCookieUtil.setJwtCookies(req.res!, tokens);
    return success(data);
  }
  @Post("/register")
  @SuccessResponse("201", "계정 생성 성공")
  @Example<RegisterResponseDto>({
    id: "1",
    createdAt: "2026-01-12T10:30:00.000Z",
  })
  public async register(
    @Body() body: RegisterRequestDto
  ): Promise<ApiResponse<RegisterResponseDto>> {
    return success(await this.authService.createUser(body));
  }
}
