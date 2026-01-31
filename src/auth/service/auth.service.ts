import { OauthProvider, PrismaClient } from '@prisma/client';
import { GoogleOAuthService } from './google-oauth.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../errors/error";
import { redis } from "../../infra/redis.client";
import { CreateUserCommand } from "../command/create-user.command";
import {
  RegisterRequestDto,
} from "../dto/request/auth.request.dto";
import {
  RegisterResponseDto,
  UpdateGoalResponseDto,
  UpdateNicknameResponseDto,
  UpdatePasswordResponseDto,
  UserProfileResponseDto,
} from "../dto/response/auth.response.dto";
import { AuthRepository } from "../repository/auth.repository";
import { compareHash, hashingString } from "../util/encrypt.util";
import { PasswordUtil } from "../util/password.util";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import nodemailer from "nodemailer";
import { EmailVerifyTypeEnum } from "../enums/send-email.enum";
import { LoginRequestDto } from "../dto/request/auth.request.dto";
import { LoginResult } from "../../types/login-result.type";
import { LoginResponseDto } from "../dto/response/auth.response.dto";
import { User } from "@prisma/client";
import { randomBytes, randomInt } from "node:crypto";


export class AuthService {
  
  private readonly SESSION_TTL = 60 * 60 * 24 * 7; // 7일
  private readonly EMAIL_VERIFICATION_CODE_TTL = 60 * 5; // 5분
  private readonly EMAIL_VERIFIED_SIGNUP_EXPIRES_IN = 60 * 10; // 10분
  private readonly ACCESS_TOKEN_EXPIRES_IN = "15m";

  constructor(
    private authRepository: AuthRepository,
    private googleOAuthService: GoogleOAuthService,
    private prisma: PrismaClient
  ) { }

  // JWT 토큰 생성
  private createJwtTokens(user: User): {
    accessToken: string;
    refreshToken: string;
    sid: string;
  } {
    const payload = {
      id: user.id.toString(),
      email: user.email,
      nickname: user.nickname,
      sid: uuid(),
    };

    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET_KEY!,
      { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET_KEY!,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken, sid: payload.sid };
  }

  // 세션 저장
  private async saveSession(
    userId: bigint,
    sid: string,
    refreshToken: string
  ): Promise<void> {
    // 기존 세션 정리 (한 번에 하나의 세션만 유지)
    await this.clearUserSession(userId);

    // 새 세션 저장
    const hashedRefreshToken = await hashingString(refreshToken);

    await redis
      .multi()
      .set(`user:${userId}:sid`, sid, { EX: this.SESSION_TTL })
      .set(`user:refreshToken:${sid}`, hashedRefreshToken, { EX: this.SESSION_TTL })
      .exec();
  }

  // 사용자의 모든 세션 정리 (userId만으로 삭제)
  private async clearUserSession(userId: bigint): Promise<void> {
    const sid = await redis.get(`user:${userId}:sid`);
    if (sid) {
      await redis.del(`user:refreshToken:${sid}`);
      await redis.del(`user:${userId}:sid`);
    }
  }

  // 로그인 결과 생성
  private async generateLoginResult(user: User): Promise<LoginResult> {
    const { accessToken, refreshToken, sid } = this.createJwtTokens(user);
    await this.saveSession(user.id, sid, refreshToken);

    return {
      data: new LoginResponseDto(user),
      tokens: { accessToken, refreshToken },
    };
  }

  // 일반 로그인
  async authUser(body: LoginRequestDto): Promise<LoginResult> {
    const user = await this.authRepository.findUserByEmail(body.email);
    if (!user) {
      throw new NotFoundException("U001", "존재하지 않는 계정 입니다.");
    }

    if (PasswordUtil.isSocialUser(user.password)) {
      throw new UnauthorizedException(
        "U002",
        "비밀번호로 로그인할 수 없는 계정입니다. 소셜 로그인을 이용하거나 비밀번호를 설정해주세요."
      );
    }

    if (!(await compareHash(body.password, user.password!))) {
      throw new UnauthorizedException("U002", "잘못된 패스워드 입니다.");
    }

    return await this.generateLoginResult(user);
  }

  // Google OAuth 로그인 처리
  async handleGoogleCallback(
    code: string, 
    state: string
  ): Promise<{ 
    tokens: { accessToken: string; refreshToken: string };
    isNewUser: boolean;
  }> {
    await this.verifyOAuthState(state);
    const googleUserInfo = await this.googleOAuthService.getUserInfo(code);

    let user = await this.authRepository.findUserBySocialProvider(
      OauthProvider.GOOGLE,
      googleUserInfo.googleUid
    );

    let isNewUser = false;

    if (!user) {
      user = await this.authRepository.findUserByEmail(googleUserInfo.email);

      if (user) {
        await this.authRepository.createOauth(
          user.id,
          OauthProvider.GOOGLE,
          googleUserInfo.googleUid
        );
      } else {
        isNewUser = true;
        const rawNickname = (googleUserInfo.nickname ?? "").trim();
        let nickname = rawNickname.slice(0, 10);

        // 닉네임이 비어있거나 중복이면 UUID 사용
        if (!nickname || !(await this.checkNicknameDuplicate(nickname))) {
          // UUID 앞 10자 사용
          nickname = uuid().replace(/-/g, '').slice(0, 10);
          
          // 만약의 경우를 위한 단일 체크
          if (!(await this.checkNicknameDuplicate(nickname))) {
            throw new ConflictException("U011", "닉네임 생성에 실패했습니다. 다시 시도해주세요.");
          }
        }

        const command = new CreateUserCommand({
          email: googleUserInfo.email,
          password: null,
          nickname,
          goal: null
        });
      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await this.authRepository.saveUser(command, tx);
        await this.authRepository.createOauth(
          newUser.id,
          OauthProvider.GOOGLE,
          googleUserInfo.googleUid,
          tx
        );
        return newUser;
      });
    }
  }

  // JWT 토큰만 생성 (LoginResponseDto 생성 안함)
  const { accessToken, refreshToken, sid } = this.createJwtTokens(user);
  await this.saveSession(user.id, sid, refreshToken);

  return {
    tokens: { accessToken, refreshToken },
    isNewUser
  };
  }

  // Google Auth URL 가져오기 (state 생성 및 저장)
  async getGoogleAuthUrl(): Promise<string> {
    // 랜덤 state 생성 (32바이트 = 64자 hex)
    const state = randomBytes(32).toString('hex');

    // Redis에 5분간 저장
    const stateKey = `oauth:state:${state}`;
    await redis.set(stateKey, 'valid', { EX: 300 });

    return this.googleOAuthService.getAuthUrl(state);
  }

  // State 검증
  private async verifyOAuthState(state: string): Promise<void> {
    const stateKey = `oauth:state:${state}`;
    const isValid = await redis.get(stateKey);

    if (!isValid) {
      throw new UnauthorizedException('A010', '잘못된 OAuth 요청입니다.');
    }

    // 사용된 state는 즉시 삭제 (재사용 방지)
    await redis.del(stateKey);
  }

  // 토큰 갱신
  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET_KEY!
      ) as any;

      const storedHash = await redis.get(`user:refreshToken:${decoded.sid}`);
      if (!storedHash) {
        throw new UnauthorizedException("U003", "만료된 세션입니다.");
      }

      if (!(await compareHash(refreshToken, storedHash))) {
        throw new UnauthorizedException("U004", "유효하지 않은 토큰입니다.");
      }

      const payload = {
        id: decoded.id,
        email: decoded.email,
        nickname: decoded.nickname,
        sid: decoded.sid,
      };

      const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET_KEY!,
        { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN }
      );

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException("U005", "리프레시 토큰이 만료되었습니다.");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException("U006", "유효하지 않은 토큰입니다.");
      }
      throw error;
    }
  }

  // 로그아웃
  async logout(userId: bigint, sid: string): Promise<void> {
    await redis.del(`user:${userId}:sid`);
    await redis.del(`user:refreshToken:${sid}`);
  }

  // 회원가입
  async createUser(body: RegisterRequestDto): Promise<RegisterResponseDto> {
    const isExist =
      (await this.authRepository.findUserByEmail(body.email)) !== null;

    if (isExist) {
      throw new ConflictException("U003", "이미 존재하는 계정 입니다.");
    }

    const verified = await redis.get(`email:verified:REGISTER:${body.email}`);

    if (!verified) {
      throw new UnauthorizedException(
        "A003",
        "이메일 인증이 필요합니다."
      );
    }

    const isNicknameAvailable = await this.checkNicknameDuplicate(body.nickname);
    if (!isNicknameAvailable) {
      throw new ConflictException("U009", "이미 사용 중인 닉네임입니다.");
    }

    const command = new CreateUserCommand({
      email: body.email,
      password: await hashingString(body.password),
      nickname: body.nickname,
      goal: body.goal || null
    });
    const user = await this.authRepository.saveUser(command);

    await redis.del(`email:verified:REGISTER:${body.email}`);

    return new RegisterResponseDto(user);
  }

  // 이메일 인증 코드 생성
  private generateEmailCode(): string {
    return randomInt(100000, 1000000).toString(); // 6자리 숫자
  }

  // 이메일 인증 코드 전송
  async sendEmailVerificationCode(
    email: string,
    type: EmailVerifyTypeEnum
  ): Promise<void> {
    const user = await this.authRepository.findUserByEmail(email);

    if (type === "REGISTER") {
      if (user) {
        throw new ConflictException("U003", "이미 존재하는 계정 입니다.");
      }
    } else if (type === "RESET_PASSWORD") {
      if (!user) {
        throw new NotFoundException("U001", "존재하지 않는 계정입니다.");
      }
    }

    const attemptKey = `email:send_attempt:${type}:${email}`;
    const attempts = await redis.get(attemptKey);

    if (attempts && parseInt(attempts) >= 5) {
      throw new UnauthorizedException(
        "A010",
        "인증 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요."
      );
    }

    const code = this.generateEmailCode();

    await redis.set(`email:verify:${type}:${email}`, code, { EX: this.EMAIL_VERIFICATION_CODE_TTL });

    const newCount = await redis.incr(attemptKey);
    if (newCount === 1) {
      await redis.expire(attemptKey, 3600);
    }

    await this.sendEmail(email, code, type);
  }

  // 이메일 인증 코드 검증
  async verifyEmailVerificationCode(
    email: string,
    code: string,
    type: EmailVerifyTypeEnum
  ): Promise<void> {
    const savedCode = await redis.get(`email:verify:${type}:${email}`);

    if (!savedCode || savedCode !== code) {
      throw new UnauthorizedException(
        "A002",
        "인증번호가 올바르지 않거나 만료되었습니다."
      );
    }

    await redis.del(`email:verify:${type}:${email}`);
    await redis.set(`email:verified:${type}:${email}`, "true", {
      EX: this.EMAIL_VERIFIED_SIGNUP_EXPIRES_IN,
    });
  }

  // 이메일 전송
  private async sendEmail(
    email: string,
    code: string,
    type: EmailVerifyTypeEnum
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const emailTemplates = {
      REGISTER: {
        subject: "[회원가입] Donakawa 이메일 인증 코드",
        title: "Donakawa 회원가입 이메일 인증",
        description: "아래 인증 코드를 입력해 회원가입을 완료해주세요.",
      },
      RESET_PASSWORD: {
        subject: "[비밀번호 재설정] Donakawa 이메일 인증 코드",
        title: "Donakawa 비밀번호 재설정 인증",
        description: "아래 인증 코드를 입력해 비밀번호 재설정을 진행해주세요.",
      },
    };

    const template = emailTemplates[type];

    await transporter.sendMail({
      from: `"Donakawa" <${process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #7A5751;">${template.title}</h2>
        <p>안녕하세요, Donakawa입니다.</p>
        <p>${template.description}</p>
        <div style="
          font-size: 24px; 
          font-weight: bold; 
          margin: 20px 0; 
          padding: 10px; 
          background-color: #f0f0f0; 
          display: inline-block;
          border-radius: 5px;
        ">
          ${code}
        </div>
        <p>인증 코드는 <strong>${Math.floor(this.EMAIL_VERIFICATION_CODE_TTL / 60)}분</strong> 동안 유효합니다.</p>
        <p style="color: #999; font-size: 12px;">본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.</p>
      </div>
    `,
    });
  }

  // 비밀번호 재설정
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const verified = await redis.get(`email:verified:RESET_PASSWORD:${email}`);
    if (!verified) {
      throw new UnauthorizedException("A007", "이메일 인증이 필요합니다.");
    }

    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException("U001", "존재하지 않는 계정입니다.");
    }

    if (PasswordUtil.isSocialUser(user.password)) {
      throw new UnauthorizedException(
        "U007",
        "소셜 로그인 계정은 비밀번호 재설정이 불가능합니다."
      );
    }

    await redis.del(`email:verified:RESET_PASSWORD:${email}`);

    const hashedPassword = await hashingString(newPassword);
    await this.authRepository.updatePassword(user.id, hashedPassword);

    // 비밀번호 변경 시 기존 세션 로그아웃
    await this.clearUserSession(user.id);
  }

  // 닉네임 수정
  async updateNickname(
    userId: bigint,
    newNickname: string
  ): Promise<UpdateNicknameResponseDto> {
    // 현재 사용자 조회
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException("U001", "존재하지 않는 계정입니다.");
    }
    if (user.nickname === newNickname) {
      throw new ConflictException("U008", "현재 닉네임과 동일합니다.");
    }
    const isNicknameAvailable = await this.checkNicknameDuplicate(newNickname);
    if (!isNicknameAvailable) {
      throw new ConflictException("U009", "이미 사용 중인 닉네임입니다.");
    }
    // 닉네임 업데이트
    const updatedUser = await this.authRepository.updateNickname(userId, newNickname);
    
    return new UpdateNicknameResponseDto(updatedUser);
  }
  // 닉네임 중복 확인
  async checkNicknameDuplicate(
    nickname: string,
    excludeUserId?: bigint
  ): Promise<boolean> {
    const existingUser = await this.authRepository.findUserByNickname(nickname);
  
    if (existingUser && existingUser.id !== excludeUserId) {
      return false;  // 중복
    }
    return true;  // 사용 가능
  }
  // 목표 수정
  async updateGoal(
    userId: bigint,
    newGoal: string
  ): Promise<UpdateGoalResponseDto> {
    // 현재 사용자 조회
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException("U001", "존재하지 않는 계정입니다.");
    }
    // 현재 목표 동일한지 확인
    if (user.goal === newGoal) {
      throw new ConflictException("U008", "현재 목표와 동일합니다.");
    }

    // 목표 업데이트
    const updatedUser = await this.authRepository.updateGoal(userId, newGoal);
    
    return new UpdateGoalResponseDto(updatedUser);
  }
  /**
 * 비밀번호 확인 (rate limiting 적용)
 */
  async verifyPassword(
    userId: bigint,
    password: string
  ): Promise<boolean> {
    // Rate limiting 체크
    const key = `password-verify:${userId}`;
    const attempts = await redis.get(key);
    
    if (attempts && parseInt(attempts) >= 10) {
      throw new UnauthorizedException(
        "A014",
        "비밀번호 확인 시도 횟수를 초과했습니다. 5분 후 다시 시도해주세요."
      );
    }

  const user = await this.authRepository.findUserById(userId);
  
  if (!user) {
    throw new NotFoundException("U001", "존재하지 않는 계정입니다.");
  }

  // 소셜 로그인 사용자 체크
  if (PasswordUtil.isSocialUser(user.password)) {
    throw new UnauthorizedException(
      "U010",
      "소셜 로그인 계정은 비밀번호가 설정되지 않았습니다."
    );
  }
  const isValid = await compareHash(password, user.password!);
  
  // 실패 로그
  if (!isValid) {
    // 시도 횟수 증가
    const newCount = await redis.incr(key);
    if (newCount === 1) {
      await redis.expire(key, 300); // 5분
    }
    console.log({
      event: 'password_verify_failed',
      userId: user.id.toString(),
      timestamp: new Date()
    });
  }
  // 검증 성공 시 상태 저장
  if (isValid) {
    await redis.set(
      `password-verified:${userId}`, 
      'true', 
      { EX: 300 }  // 5분
    );
  }
  return isValid;
}

/**
 * 비밀번호 설정/변경 (통합)
 * - 소셜 로그인 사용자: 비밀번호 설정
 * - 일반 사용자: 비밀번호 변경 (프론트에서 verify-password 먼저 호출 필요)
 */
async updatePassword(
  userId: bigint,
  newPassword: string
): Promise<UpdatePasswordResponseDto> {
  const user = await this.authRepository.findUserById(userId);
  
  if (!user) {
    throw new NotFoundException("U001", "존재하지 않는 계정입니다.");
  }

  const isSocialUser = PasswordUtil.isSocialUser(user.password);
  
  // 일반 사용자: 검증 상태 확인
  if (!isSocialUser) {
    const verified = await redis.get(`password-verified:${userId}`);
    
    if (!verified) {
      throw new UnauthorizedException(
        "A015",
        "현재 비밀번호 확인이 필요합니다."
      );
    }
    const isSame = await compareHash(newPassword, user.password!);
    if (isSame) {
    throw new ConflictException(
      "U012", 
      "현재 비밀번호와 동일한 비밀번호로 변경할 수 없습니다."
    );
  }
    // 일회용: 사용 후 삭제
    await redis.del(`password-verified:${userId}`);
  }

  // 비밀번호 변경
  const hashedPassword = await hashingString(newPassword);
  await this.authRepository.updatePassword(userId, hashedPassword);
  await this.clearUserSession(userId);

  const updatedUser = await this.authRepository.findUserById(userId);
  return new UpdatePasswordResponseDto(updatedUser!);
}

  // 회원탈퇴
  async deleteAccount(userId: bigint, sid: string, password?: string): Promise<void> {
    const user = await this.authRepository.findUserById(userId);
    
    if (!user) {
      throw new NotFoundException("U001", "존재하지 않는 계정입니다.");
    }

    // 일반 로그인 사용자는 비밀번호 확인
    if (PasswordUtil.hasPassword(user.password)) {
      if (!password) {
        throw new UnauthorizedException(
          "U008",
          "비밀번호 확인이 필요합니다."
        );
      }
      
      if (!(await compareHash(password, user.password!))) {
        throw new UnauthorizedException("U002", "잘못된 패스워드입니다.");
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await this.authRepository.deleteUser(userId, tx);
    });

    // 세션 정리 (실패해도 자동 만료됨)
    try {
      await this.clearUserSession(userId);
    } catch (error) {
      // 세션 삭제 실패는 로그만 남김 (TTL로 자동 만료되므로 치명적이지 않음)
      console.error('Failed to clear user session:', error);
    }
  }
    async getMyProfile(userId: bigint): Promise<UserProfileResponseDto> {
      const user = await this.authRepository.findUserById(userId);
      
      if (!user) {
        throw new NotFoundException("U001", "존재하지 않는 계정입니다.");
      }
      
      return new UserProfileResponseDto(user);
    }
  }