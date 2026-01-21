import {
  Body,
  Example,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Request,
} from "tsoa";
import { ApiResponse, success } from "../../common/response";
import {
  RegisterResponseDto,
} from "../dto/response/auth.response.dto";
import { AuthService } from "../service/auth.service";
import { container } from "../../container";
import {
  RegisterRequestDto,
  SendEmailCodeRequestDto,
} from "../dto/request/auth.request.dto";
import { JwtCookieUtil } from "../util/jwt-cookie.util";
import { Request as ExpressRequest } from "express";

@Route("/auth")
@Tags("Auth")
export class AuthController {
  private readonly authService: AuthService = container.auth.service;

  @Post("/register")
  @SuccessResponse("201", "계정 생성 성공") //응답값 확인 필요
  @Example<RegisterResponseDto>({
    id: "1",
    createdAt: "2026-01-12T10:30:00.000Z",
  })
  public async register(
    @Body() body: RegisterRequestDto,
  ): Promise<ApiResponse<RegisterResponseDto>> {
    return success(await this.authService.createUser(body));
  }

@Post("email/send-code")
@SuccessResponse("200", "이메일 인증 코드 전송 성공")
public async sendEmailVerificationCode(
  @Body() body: SendEmailCodeRequestDto
): Promise<ApiResponse<null>> {
  console.log('controller 들어옴');
  await this.authService.sendEmailVerificationCode(body.email, body.type);
  return success(null);
}
@Post("email/verify-code")
@SuccessResponse("200", "이메일 인증 코드 검증 성공")
public async verifyEmailVerificationCode(
  @Body() body: SendEmailCodeRequestDto & { code: string }
): Promise<ApiResponse<null>> {
  await this.authService.verifyEmailVerificationCode(
    body.email,
    body.code,
    body.type
  );
  return success(null);
}
}