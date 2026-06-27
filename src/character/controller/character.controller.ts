import {
  Body,
  Example,
  Response,
  Get,
  Post,
  Patch,
  Put,
  Route,
  SuccessResponse,
  Tags,
  Security,
  Request,
  Query,
  Middlewares,
} from "tsoa";
import { AppError } from "../../errors/app.error";
import { ApiResponse, success } from "../../common/response";
import { Request as ExpressRequest } from "express";
import { HamsterTalkResponseDto } from "../dto/response/character.response.dto";
import { CharacterService } from "../service/character.service";
import { container } from "../../container";

@Route("/character")
@Tags("Character")
@Security("jwt")
export class CharacterController {
  private readonly characterService: CharacterService =
    container.character.service;

  /**
   * @summary 도나햄 한마디 조회 API
   */
  @Get("/comment")
  @SuccessResponse("200", "도나햄 한마디 조회 성공")
  public async getHamsterTalk(
    @Request() req: ExpressRequest,
  ): Promise<ApiResponse<HamsterTalkResponseDto>> {
    const userId = req.user!.id;
    const data = await this.characterService.getHamsterTalk(userId);

    return success(data);
  }
}
