import { User, Oauth } from "@prisma/client";

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
    this.goal = entity.goal!;
    this.updatedAt = (entity.updatedAt || new Date()).toISOString();
  }
}
export class UserProfileResponseDto {
	readonly id: string;
	readonly email: string;
	readonly nickname: string;
	readonly goal: string | null; 
	readonly hasPassword: boolean; 
  readonly provider: string;

	constructor(entity: User & { oauth: Oauth[] }) {
	this.id = entity.id.toString();
	this.email = entity.email;
	this.nickname = entity.nickname;
	this.goal = entity.goal;
	this.hasPassword = !!entity.password;
  // 이메일 가입이면 "email", OAuth면 해당 provider
    this.provider = entity.oauth.length > 0 
      ? entity.oauth[0].provider.toLowerCase()
      : "email";	
    }
}
export class UpdatePasswordResponseDto {
  readonly id: string;
  readonly updatedAt: string;
  
  constructor(entity: User) {
    this.id = entity.id.toString();
    this.updatedAt = (entity.updatedAt || new Date()).toISOString();
  }
}