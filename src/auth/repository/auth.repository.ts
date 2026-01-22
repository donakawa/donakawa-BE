import { Prisma, PrismaClient, User } from "@prisma/client";
import { AuthRepositoryInterface } from "./auth.interface.repository";
import { CreateUserCommand } from "../command/create-user.command";
export class AuthRepository implements AuthRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) {}
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
}
