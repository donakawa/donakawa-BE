import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength, IsOptional, MaxLength } from "class-validator";
import { Example } from "tsoa";
import { EmailVerifyTypeEnum } from "../../enums/send-email.enum";
import { User } from "@prisma/client";

export class RegisterRequestDto {
  @Example("example@example.com")
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @Example("p@ssword123!")
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "비밀번호는 8자 이상이어야 합니다." })
  @MaxLength(12, { message: "비밀번호는 12자 이하이어야 합니다." })
  @Matches(/(?=.*[a-zA-Z])(?=.*\d)/, { message: "비밀번호는 영문과 숫자를 포함해야 합니다." })
  password!: string;
  @Example("UMC")
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: "닉네임은 10자 이하여야 합니다." })
  nickname!: string;
  @Example("new-goal")
  @IsString()
  @IsNotEmpty()
  @MaxLength(10, { message: "목표는 10자 이하여야 합니다." })
  goal!: string;
}

export class SendEmailCodeRequestDto {
  @Example("example@skuniv.ac.kr")
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Example("REGISTER")
  @IsEnum(EmailVerifyTypeEnum)
  @IsNotEmpty()
  type!: EmailVerifyTypeEnum;
}

export class LoginRequestDto {
  @Example("example@example.com")
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @Example("p@ssword123!")
  @IsString()
  @IsNotEmpty()
  password!: string;
}

 export class PasswordResetConfirmDto {
  @Example("example@example.com")
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @Example("p@ssword123!")
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "비밀번호는 8자 이상이어야 합니다." })
  @MaxLength(12, { message: "비밀번호는 12자 이하이어야 합니다." })
  @Matches(/(?=.*[a-zA-Z])(?=.*\d)/, { message: "비밀번호는 영문과 숫자를 포함해야 합니다." })
   newPassword!: string;
 }

 export class DeleteAccountRequestDto {
  @Example("p@ssword123!")
  @IsString()
  @IsOptional()
  password?: string;
}

export class UpdateNicknameRequestDto {
  @Example("new-nickname")
  @IsString()
  @IsNotEmpty()
  @MaxLength(10, { message: "닉네임은 10자 이하여야 합니다." })
  nickname!: string;
}

export class UpdateGoalRequestDto {
  @Example("new-goal")
  @IsString()
  @IsNotEmpty()
  @MaxLength(10, { message: "목표는 10자 이하여야 합니다." })
  goal!: string;
}