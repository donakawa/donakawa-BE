import { LoginResponseDto } from "../auth/dto/response/auth.response.dto";

export type LoginResult = {
  data: LoginResponseDto;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};