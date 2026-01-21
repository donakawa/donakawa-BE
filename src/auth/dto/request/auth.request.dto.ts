import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Example } from "tsoa";
import { EmailVerifyTypeEnum } from "../../enums/send-email.enum";

export class RegisterRequestDto {
  @Example("example@example.com")
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @Example("p@ssword!")
  @IsString()
  @IsNotEmpty()
  password!: string;
  @Example("UMC")
  @IsString()
  @IsNotEmpty()
  nickname!: string;
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




