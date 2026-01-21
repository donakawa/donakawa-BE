import { User } from "@prisma/client";

export class RegisterResponseDto {
  readonly id: string;
  readonly createdAt: string;
  constructor(entity: User) {
    this.id = entity.id.toString();
    this.createdAt = entity.createdAt.toISOString();
  }
}
