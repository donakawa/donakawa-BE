import { Get, Route, Tags } from "tsoa";
import { AppError } from "../../errors/app.error";
import { ApiResponse, success } from "../../common/response";
import { HelloResponseDto } from "../dto/response/auth.response.dto";
import { AuthService } from "../service/auth.service";
import { container } from "../../container";

@Route("/auth")
@Tags("Auth")
export class AuthController {
  private readonly authService: AuthService = container.auth.service;
  @Get("/hello")
  public hello(): ApiResponse<HelloResponseDto> {
    return success(HelloResponseDto.from(this.authService.hello()));
  }
  @Get("/hello-fail")
  public helloFail(): ApiResponse<HelloResponseDto> {
    throw new AppError({
      errorCode: "D001",
      message: "테스트 에러",
      statusCode: 400,
    });
  }
}
