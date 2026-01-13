import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Example } from "tsoa";

export class LoginRequestDto {
  @Example("example@example.com")
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @Example("p@ssword!")
  @IsString()
  @IsNotEmpty()
  password!: string;
}
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
