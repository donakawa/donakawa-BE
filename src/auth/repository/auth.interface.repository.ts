import { Prisma, User, Oauth } from "@prisma/client";
import { CreateUserCommand } from "../command/create-user.command";
export interface AuthRepositoryInterface {
  findUserByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null>;
  findUserById(id: bigint, tx?: Prisma.TransactionClient): Promise<User & { oauth: Oauth[] } | null>;  
  saveUser(
    command: CreateUserCommand,
    tx?: Prisma.TransactionClient
  ): Promise<User>;
  updatePassword(
    userId: bigint,
    hashedPassword: string,
    tx?: Prisma.TransactionClient
  ): Promise<void>;
  deleteUser(userId: bigint, tx?: Prisma.TransactionClient): Promise<void>;
  updateNickname(
    userId: bigint,
    nickname: string,
    tx?: Prisma.TransactionClient
  ): Promise<User>;
  
  findUserByNickname(
    nickname: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null>;

  updateGoal(
  userId: bigint,
  goal: string,
  tx?: Prisma.TransactionClient
  ): Promise<User>;
}
