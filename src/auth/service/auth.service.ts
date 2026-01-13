import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../errors/error";
import { redis } from "../../infra/redis.client";
import { CreateUserCommand } from "../command/create-user.command";
import {
  LoginRequestDto,
  RegisterRequestDto,
} from "../dto/request/auth.request.dto";
import {
  LoginResponseDto,
  RegisterResponseDto,
} from "../dto/response/auth.response.dto";
import { AuthRepository } from "../repository/auth.repository";
import { LoginResult } from "../types/login-result.type";
import { compareHash, hashingString } from "../util/encrypt.util";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}
  public hello() {
    return "hello Donakawa!";
  }
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
      { expiresIn: "5m" }
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET_KEY!,
      { expiresIn: "14d" }
    );
    const alreadyExistSid = await redis.get(`user:${user.id}:sid`);
    if (alreadyExistSid) {
      await redis.del(`user:refreshToken:${alreadyExistSid}`);
    }
    await redis.set(`user:${user.id}:sid`, payload.sid, {
      EX: 60 * 60 * 24 * 14,
    });
    await redis.set(
      `user:refreshToken:${payload.sid}`,
      await hashingString(refreshToken),
      {
        EX: 60 * 60 * 24 * 14,
      }
    );
    return {
      data: new LoginResponseDto(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
  async createUser(body: RegisterRequestDto): Promise<RegisterResponseDto> {
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
}
