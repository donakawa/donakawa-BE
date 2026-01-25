import {
  Body,
  Example,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Request,
  Security,
  Get,
  Query,
} from "tsoa";
import { ApiResponse, success } from "../../common/response";
import {
  RegisterResponseDto,
  LoginResponseDto,
} from "../dto/response/auth.response.dto";
import { AuthService } from "../service/auth.service";
import { container } from "../../container";
import {
  RegisterRequestDto,
  SendEmailCodeRequestDto,
  LoginRequestDto,
  PasswordResetConfirmDto,
} from "../dto/request/auth.request.dto";
import { JwtCookieUtil } from "../util/jwt-cookie.util";
import { Request as ExpressRequest } from "express";
import { UnauthorizedException } from "../../errors/error";

@Route("/auth")
@Tags("Auth")
export class AuthController {
  private readonly authService: AuthService = container.auth.service;

  @Post("/register")
  @SuccessResponse("201", "계정 생성 성공")
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
    @Body() body: SendEmailCodeRequestDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.sendEmailVerificationCode(body.email, body.type);
    return success(null);
  }

  @Post("email/verify-code")
  @SuccessResponse("200", "이메일 인증 코드 검증 성공")
  public async verifyEmailVerificationCode(
    @Body() body: SendEmailCodeRequestDto & { code: string },
  ): Promise<ApiResponse<null>> {
    await this.authService.verifyEmailVerificationCode(
      body.email,
      body.code,
      body.type,
    );
    return success(null);
  }
  //로그인
  @Post("/login")
  @SuccessResponse("200", "로그인 성공")
  public async login(
    @Body() body: LoginRequestDto,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<LoginResponseDto>> {
    const { data, tokens } = await this.authService.authUser(body);
    JwtCookieUtil.setJwtCookies(req.res!, tokens);
    return success(data);
  }

  // 토큰 갱신
  @Post("/refresh")
  @SuccessResponse("200", "토큰 갱신 성공")
  public async refresh(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    // 쿠키에서 refresh token 읽기
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("A004", "리프레시 토큰이 없습니다.");
    }

    const { accessToken } =
      await this.authService.refreshAccessToken(refreshToken);

    // 새 access token을 쿠키에 저장
    JwtCookieUtil.setAccessTokenCookie(req.res!, accessToken);

    return success({ accessToken });
  }
  @Post("/account-recovery/password")
  @SuccessResponse("200", "비밀번호 재설정 성공")
  public async resetPassword(
    @Body() body: PasswordResetConfirmDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.resetPassword(body.email, body.newPassword);
    return success(null);
  }

  // Google 로그인 시작 - 프론트에서 이 URL로 리다이렉트
  @Get("/google-login")
  @SuccessResponse("302", "Google 로그인 페이지로 리다이렉트")
  public async initiateGoogleLogin(@Request() req: ExpressRequest): Promise<void> {
    const authUrl = await this.authService.getGoogleAuthUrl(); 
    req.res!.redirect(authUrl);
  }

  // Google OAuth 콜백 - Google이 여기로 리다이렉트
  @Get("/google/callback")
  @SuccessResponse("302", "로그인 성공")
  public async googleCallback(
    @Query() code: string,
    @Query() state: string,  // state 파라미터 추가
    @Request() req: ExpressRequest
  ): Promise<void> {
    try {
      // state도 함께 전달
      const { data, tokens } = await this.authService.handleGoogleCallback(
        code,
        state,
      );

      JwtCookieUtil.setJwtCookies(req.res!, tokens);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      req.res!.redirect(`${frontendUrl}/auth/callback?success=true`);
    } catch (error) {
      console.error("Google Login Error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      req.res!.redirect(
        `${frontendUrl}/auth/callback?success=false&error=google_login_failed`,
      );
    }
  }
  @Post("/logout")
  @Security("jwt")
  @SuccessResponse("200", "로그아웃 성공")
  public async logout(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<null>> {
    const user = req.user!; // JWT 미들웨어에서 주입된 사용자 정보
    await this.authService.logout(BigInt(user.id), user.sid);
    JwtCookieUtil.clearJwtCookies(req.res!);
    return success(null);
  }
}
