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
  Delete,
  Patch
} from "tsoa";
import { ApiResponse, success } from "../../common/response";
import {
  RegisterResponseDto,
  LoginResponseDto,
  UpdateNicknameResponseDto,
  UpdateGoalResponseDto,
  UserProfileResponseDto,
} from "../dto/response/auth.response.dto";
import { AuthService } from "../service/auth.service";
import { container } from "../../container";
import {
  RegisterRequestDto,
  SendEmailCodeRequestDto,
  LoginRequestDto,
  PasswordResetConfirmDto,
  DeleteAccountRequestDto,
  UpdateNicknameRequestDto,
  UpdateGoalRequestDto,
} from "../dto/request/auth.request.dto";
import { JwtCookieUtil } from "../util/jwt-cookie.util";
import { Request as ExpressRequest } from "express";
import { BadRequestException, UnauthorizedException } from "../../errors/error";


@Route("/auth")
@Tags("Auth")
export class AuthController {
  private readonly authService: AuthService = container.auth.service;
  /**
   * @summary 회원가입 API
    */
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
  /**
   * @summary 이메일 인증 코드 전송 API
  */
  @Post("email/send-code")
  @SuccessResponse("200", "이메일 인증 코드 전송 성공")
  public async sendEmailVerificationCode(
    @Body() body: SendEmailCodeRequestDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.sendEmailVerificationCode(body.email, body.type);
    return success(null);
  }
  /**
   * @summary 이메일 인증 코드 검증 API
  */
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
  /**
   * @summary 로그인 API
  */
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

  /**
   * @summary 토큰 리프레시 API
  */
  @Post("/refresh")
  @SuccessResponse("200", "토큰 리프레시 성공")
  public async refresh(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<null>> {
    // 쿠키에서 refresh token 읽기
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("A004", "리프레시 토큰이 없습니다.");
    }

    const { accessToken } =
      await this.authService.refreshAccessToken(refreshToken);

    // 새 access token을 쿠키에 저장
    JwtCookieUtil.setAccessTokenCookie(req.res!, accessToken);

    return success(null);
  }
  /**
   * @summary 비밀번호 재설정 API
  */
  @Post("/account-recovery/password")
  @SuccessResponse("200", "비밀번호 재설정 성공")
  public async resetPassword(
    @Body() body: PasswordResetConfirmDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.resetPassword(body.email, body.newPassword);
    return success(null);
  }
  /**
   * @summary Google 로그인 API
  */
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
  /**
   * @summary 로그아웃 API
  */
  @Post("/logout")
  @Security("jwt")
  @SuccessResponse("200", "로그아웃 성공")
  public async logout(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<null>> {
    const user = req.user;
    try {
      if (!user?.id || !user?.sid) {
        throw new UnauthorizedException("A004", "인증 정보가 없습니다.");
      }
      await this.authService.logout(BigInt(user.id), user.sid);
      return success(null);
    } finally {
      JwtCookieUtil.clearJwtCookies(req.res!);
    }
  }
  /**
   * @summary 계정 삭제 API
  */
  @Delete("/account")
  @Security("jwt")
  @SuccessResponse("200", "회원 탈퇴 성공")
  public async deleteAccount(
    @Body() body: DeleteAccountRequestDto,
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<null>> {
    const user = req.user!;
    if (!user?.id || !user?.sid) {
     throw new UnauthorizedException("A004", "인증 정보가 없습니다.");
    }
    await this.authService.deleteAccount(
      BigInt(user.id),
      user.sid,
      body.password
    );
    // 쿠키 삭제
    JwtCookieUtil.clearJwtCookies(req.res!);
    
    return success(null);
  }
  /**
   * @summary 닉네임 수정 API
  */
  @Patch("/profile/nickname")
  @Security("jwt")
  @SuccessResponse("200", "닉네임 수정 성공")
  public async updateNickname(
    @Body() body: UpdateNicknameRequestDto,
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<UpdateNicknameResponseDto>> {
    const user = req.user;
    
    if (!user?.id) {
      throw new UnauthorizedException("A004", "인증 정보가 없습니다.");
    }

    const result = await this.authService.updateNickname(
      BigInt(user.id),
      body.nickname
    );
    
    return success(result);
  }
  /**
   * @summary 목표 수정 API
  */
  @Patch("/profile/goal")
  @Security("jwt")
  @SuccessResponse("200", "목표 수정 성공")
  public async updateGoal(
    @Body() body: UpdateGoalRequestDto,
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<UpdateGoalResponseDto>> {
    const user = req.user;
    
    if (!user?.id) {
      throw new UnauthorizedException("A004", "인증 정보가 없습니다.");
    }

    const result = await this.authService.updateGoal(
      BigInt(user.id),
      body.goal
    );
    
    return success(result);
  }
  /**
   * @summary 닉네임 중복 확인 API
  */
  @Get("/nickname/duplicate")
  @SuccessResponse("200", "닉네임 중복 확인 완료")
  public async checkNicknameDuplicate(
    @Query() nickname: string,
    @Request() req: ExpressRequest  // 인증 선택적
  ): Promise<ApiResponse<{ isAvailable: boolean }>> {
    if (!nickname) {
      throw new BadRequestException("V001", "닉네임을 입력해주세요.");
    }
    const excludeUserId = req.user ? BigInt(req.user!.id) : undefined;
    
    const isAvailable = await this.authService.checkNicknameDuplicate(
      nickname, 
      excludeUserId
    );
    
    return success({ isAvailable });
  }
  /**
   * @summary 유저 정보 조회 API
  */
  @Get("/me")
  @SuccessResponse("200", "내 정보 조회 완료")
  @Security("jwt")
  public async getMyProfile(
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<UserProfileResponseDto>> {
    const user = req.user;
    if (!user?.id) {
      throw new UnauthorizedException("A004", "인증 정보가 없습니다.");
    }
    
    const result = await this.authService.getMyProfile(BigInt(user.id));
    
    return success(result);
  }
}


