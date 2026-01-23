import { OauthProvider, Prisma, PrismaClient, User, Oauth } from "@prisma/client";
import { AuthRepositoryInterface } from "./auth.interface.repository";
import { CreateUserCommand } from "../command/create-user.command";

export class AuthRepository implements AuthRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async findUserByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    const db = tx ?? this.prisma;
    return await db.user.findUnique({ where: { email } });
  }

  async findUserById(
    id: bigint,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    const db = tx ?? this.prisma;
    return await db.user.findUnique({ where: { id } });
  }

  async saveUser(
    command: CreateUserCommand,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    const db = tx ?? this.prisma;
    return await db.user.create({
      data: {
        email: command.email,
        password: command.password,
        nickname: command.nickname,
      },
    });
  }

  async updatePassword(
    userId: bigint,
    hashedPassword: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // 소셜 로그인 정보로 사용자 찾기
  async findUserBySocialProvider(
    provider: OauthProvider,
    uid: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    const db = tx ?? this.prisma;
    const oauth = await db.oauth.findUnique({
      where: {
        provider_uid: {  // 복합 유니크 키
          provider,
          uid,
        },
      },
      include: {
        user: true,
      },
    });

    return oauth?.user || null;
  }


  // 소셜 로그인 정보 추가
  async createOauth(
    userId: bigint,
    provider: OauthProvider,
    uid: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const db = tx ?? this.prisma;
    await db.oauth.create({
      data: {
        userId,
        provider,
        uid,
      },
    });
  }

  // 사용자의 소셜 로그인 정보 조회
  async findOauthByUserId(
    userId: bigint,
    provider: OauthProvider,
    tx?: Prisma.TransactionClient
  ): Promise<Oauth | null> {
    const db = tx ?? this.prisma;
    return await db.oauth.findUnique({
      where: {
        userId_provider: {  // 복합 유니크 키
          userId,
          provider,
        },
      },
    });
  }
}