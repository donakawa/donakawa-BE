import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import {
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
} from "../dto/response/auth.response.dto";
import { AuthRepository } from "../repository/auth.repository";
import { compareHash, hashingString } from "../util/encrypt.util";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import nodemailer from "nodemailer";
import { EmailVerifyTypeEnum } from "../enums/send-email.enum";
import { LoginRequestDto } from "../dto/request/auth.request.dto";
import { LoginResult } from "../../types/login-result.type";
import { LoginResponseDto } from "../dto/response/auth.response.dto";


export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  // 로그인
  async authUser(body: LoginRequestDto): Promise<LoginResult> {
    const user = await this.authRepository.findUserByEmail(body.email);
    if (!user)
      throw new NotFoundException("U001", "존재하지 않는 계정 입니다.");

    if (!(await compareHash(body.password, user.password!)))
      throw new UnauthorizedException("U002", "잘못된 패스워드 입니다.");

    const payload = {
      id: user.id.toString(),
      email: user.email,
      nickname: user.nickname,
      sid: uuid(),
    };

    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET_KEY!,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET_KEY!,
      { expiresIn: "7d" }
    );

    // 기존 세션 정리
    const alreadyExistSid = await redis.get(`user:${user.id}:sid`);
    if (alreadyExistSid) {
      await redis.del(`user:refreshToken:${alreadyExistSid}`);
    }

    // 새 세션 저장 (7일)
    const TTL = 60 * 60 * 24 * 7;

    // TTL = 초 단위
    await redis.set(`user:${user.id}:sid`, payload.sid, { EX: TTL });

    await redis.set(
      `user:refreshToken:${payload.sid}`,
      await hashingString(refreshToken),
      { EX: TTL }
    );


    return {
      data: new LoginResponseDto(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
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

      // Redis에서 저장된 해시 가져오기
      const storedHash = await redis.get(`user:refreshToken:${decoded.sid}`);
      if (!storedHash) {
        throw new UnauthorizedException("U003", "만료된 세션입니다.");
      }

      // 토큰 해시 비교
      if (!(await compareHash(refreshToken, storedHash))) {
        throw new UnauthorizedException("U004", "유효하지 않은 토큰입니다.");
      }

      // 새 Access Token 발급
      const payload = {
        id: decoded.id,
        email: decoded.email,
        nickname: decoded.nickname,
        sid: decoded.sid,
      };

      const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET_KEY!,
        { expiresIn: "1h" }
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
  async logout(userId: number, sid: string): Promise<void> {
    await redis.del(`user:${userId}:sid`);
    await redis.del(`user:refreshToken:${sid}`);
  }

  // 전체 세션 로그아웃 (모든 기기)
  async logoutAllDevices(userId: number): Promise<void> {
    const sid = await redis.get(`user:${userId}:sid`);
    if (sid) {
      await redis.del(`user:${userId}:sid`);
      await redis.del(`user:refreshToken:${sid}`);
    }
  }

  // 회원가입
  async createUser(body: RegisterRequestDto): Promise<RegisterResponseDto> {
    const verified = await redis.get(
      `email:verified:REGISTER:${body.email}`
    );

    if (!verified) {
      throw new UnauthorizedException(
        "A003",
        "이메일 인증이 필요합니다."
      );
    }

    await redis.del(`email:verified:REGISTER:${body.email}`);

    const command = new CreateUserCommand({
      email: body.email,
      password: await hashingString(body.password),
      nickname: body.nickname,
    });

    const isExist =
      (await this.authRepository.findUserByEmail(command.email)) !== null;

    if (isExist)
      throw new ConflictException("U003", "이미 존재하는 계정 입니다.");

    const user = await this.authRepository.saveUser(command);
    return new RegisterResponseDto(user);
  }


   // 이메일 인증 코드 생성
  private generateEmailCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 숫자
  }
  // 이메일 인증 코드 전송

  async sendEmailVerificationCode(
    email: string,
    type: EmailVerifyTypeEnum
  ): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new UnauthorizedException(
        "A001",
        "이메일 형식이 올바르지 않습니다."
      );
    }

    //이메일 중복 검사
    if (type === "REGISTER") {
      const isExist = await this.authRepository.findUserByEmail(email);
      if (isExist) {
        throw new ConflictException("U003", "이미 존재하는 계정 입니다.");
      }
    }
    //코드 생성
    const code = this.generateEmailCode();

    await redis.set(
      `email:verify:${type}:${email}`,
      code,
      { EX: 60 * 3 }
    );

    await this.sendEmail(email, code);
  }

  // ======================
  // 이메일 인증 코드 검증
  // ======================
  async verifyEmailVerificationCode(
    email: string,
    code: string,
    type: EmailVerifyTypeEnum
  ): Promise<void> {
    const savedCode = await redis.get(
      `email:verify:${type}:${email}`
    );

    if (!savedCode || savedCode !== code) {
      throw new UnauthorizedException(
        "A002",
        "인증번호가 올바르지 않거나 만료되었습니다."
      );
    }

    await redis.del(`email:verify:${type}:${email}`);

    await redis.set(
      `email:verified:${type}:${email}`,
      "true",
      { EX: 60 * 10 }
    );
  }

  //이메일 형식 검증
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

private async sendEmail(email: string, code: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // TLS: false, SSL: true
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

await transporter.sendMail({
  from: `"Donakawa" <${process.env.SMTP_USER}>`,
  to: email,
  subject: "[회원가입] Donakawa 이메일 인증 코드",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #7A5751;">Donakawa 회원가입 이메일 인증</h2>
      <p>안녕하세요, Donakawa입니다.</p>
      <p>아래 인증 코드를 입력해 회원가입을 완료해주세요.</p>
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
      <p>인증 코드는 <strong>3분</strong> 동안 유효합니다.</p>
    </div>
  `,
});
}
}
