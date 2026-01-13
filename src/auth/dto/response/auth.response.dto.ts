import { User } from "@prisma/client";

export class HelloResponseDto {
  message!: string;
  static from(message: string) {
    const dto = new this();
    dto.message = message;
    return dto;
  }
}
export class LoginResponseDto {
  readonly id: string;
  readonly email: string;
  readonly nickname: string;
  constructor(entity: User) {
    this.id = entity.id.toString();
    this.email = entity.email;
    this.nickname = entity.nickname;
  }
}
export class RegisterResponseDto {
  readonly id: string;
  readonly createdAt: string;
  constructor(entity: User) {
    this.id = entity.id.toString();
    this.createdAt = entity.createdAt.toISOString();
  }
}
