import { User } from "@prisma/client";

export class RegisterResponseDto {
  readonly id: string;
  readonly createdAt: string;
  constructor(entity: User) {
    this.id = entity.id.toString();
    this.createdAt = entity.createdAt.toISOString();
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

export class UpdateNicknameResponseDto {
  readonly id: string;
  readonly nickname: string;
  readonly updatedAt: string;
  
  constructor(entity: User) {
    this.id = entity.id.toString();
    this.nickname = entity.nickname;
    this.updatedAt = (entity.updatedAt || new Date()).toISOString();
  }
}

export class UpdateGoalResponseDto {
  readonly id: string;
  readonly goal: string;
  readonly updatedAt: string;
  
  constructor(entity: User) {
    this.id = entity.id.toString();
    this.goal = entity.nickname;
    this.updatedAt = (entity.updatedAt || new Date()).toISOString();
  }
}