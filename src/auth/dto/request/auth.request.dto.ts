import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength, IsOptional, MaxLength } from "class-validator";
import { Example } from "tsoa";
import { EmailVerifyTypeEnum } from "../../enums/send-email.enum";

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
  @MaxLength(10, { message: "닉네임은 10자 이하여야 합니다." })
  @Matches(/^[a-zA-Z0-9가-힣]+$/, {message: '닉네임은 영문, 숫자, 한글만 사용할 수 있습니다.'})
  nickname!: string;
  @Example("goal")
  @IsString()
  @IsOptional()
  @MaxLength(10, { message: "목표는 10자 이하여야 합니다." })
  goal?: string;
}

export class SendEmailCodeRequestDto {
  @Example("example@skuniv.ac.kr")
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Example("REGISTER")
  @IsEnum(EmailVerifyTypeEnum, { message: "유효하지 않은 이메일 인증 타입입니다." })
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

export class UpdateNicknameRequestDto {
  @Example("new-nickname")
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9가-힣]+$/, {message: '닉네임은 영문, 숫자, 한글만 사용할 수 있습니다.'})
  @MaxLength(10, { message: "닉네임은 10자 이하여야 합니다." })
  newNickname!: string;
}

export class UpdateGoalRequestDto {
  @Example("new-goal")
  @IsString()
  @IsNotEmpty()
  @MaxLength(10, { message: "목표는 10자 이하여야 합니다." })
  newGoal!: string;
}

// 비밀번호 확인용
export class VerifyPasswordRequestDto {
  @Example("p@ssword123!")
  @IsString()
  @IsNotEmpty()
  password!: string;
}

// 비밀번호 설정/변경용 (통합)
export class UpdatePasswordRequestDto {
  @Example("newP@ss456!")
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "비밀번호는 8자 이상이어야 합니다." })
  @MaxLength(12, { message: "비밀번호는 12자 이하이어야 합니다." })
  @Matches(/(?=.*[a-zA-Z])(?=.*\d)/, { message: "비밀번호는 영문과 숫자를 포함해야 합니다." })
  newPassword!: string;
}