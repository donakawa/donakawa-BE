import { Prisma, User } from "@prisma/client";
import { CreateUserCommand } from "../command/create-user.command";
export interface AuthRepositoryInterface {
  findUserByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null>;
  findUserById(id: bigint, tx?: Prisma.TransactionClient): Promise<User | null>;
  saveUser(
    command: CreateUserCommand,
    tx?: Prisma.TransactionClient
  ): Promise<User>;
}
