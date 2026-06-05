import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Route,
  Tags,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";

import { container } from "../../container";
import { ChatsService } from "../service/chats.service";
import {
  CreateChatRequest,
  SelectOptionRequest,
} from "../dto/request/chats.request.dto";

@Route("/chats")
@Security("jwt")
@Tags("Chats")
export class ChatsController {
  private readonly chatsService: ChatsService = container.chats.service;
  /**
   * @summary 채팅 생성
   * @description 위시 아이템을 기준으로 새로운 채팅 세션을 생성합니다. (1개의 위시 아이템 당 1개의 채팅)
   */
  @Post()
  public async createChat(
    @Body() body: CreateChatRequest,
    @Request() req: ExpressRequest,
  ) {
    const userId = Number(req.user!.id);
    return this.chatsService.createChat(userId, body);
  }

  /**
   * @summary 사용자의 채팅 목록 조회
   */
  @Get()
  async getChats(@Request() req: ExpressRequest) {
    const userId = Number(req.user!.id);

    return this.chatsService.getChats(userId);
  }

  /**
   * @summary 특정 채팅의 상세 정보 조회
   */
  @Get("/{id}")
  async getChatDetail(@Path() id: number, @Request() req: ExpressRequest) {
    const userId = Number(req.user!.id);
    return this.chatsService.getChatDetail(id, userId);
  }

  /**
   * @summary 현재 채팅 단계에 해당하는 질문 조회
   */
  @Get("/{id}/question")
  async getQuestion(@Path() id: number, @Request() req: ExpressRequest) {
    const userId = Number(req.user!.id);
    return this.chatsService.getCurrentQuestion(id, userId);
  }

  /**
   * @summary 질문에 대한 사용자의 선택지 저장
   */
  @Post("/{id}/select")
  async selectOption(
    @Path() id: number,
    @Body() body: SelectOptionRequest,
    @Request() req: ExpressRequest,
  ) {
    const userId = Number(req.user!.id);
    return this.chatsService.saveSelection(id, userId, body);
  }

  /**
   * @summary 채팅 삭제
   */
  @Delete("/{id}")
  async deleteChat(@Path() id: number, @Request() req: ExpressRequest) {
    const userId = Number(req.user!.id);
    return this.chatsService.deleteChat(id, userId);
  }

  /**
   * @summary 채팅의 최종 결과 반환
   * @description 모든 질문에 대한 답변이 완료된 후, 소비 결정 결과를 반환한다.
   */
  @Get("/{id}/result")
  async resultChat(@Path() id: number, @Request() req: ExpressRequest) {
    const userId = Number(req.user!.id);
    return this.chatsService.resultChat(id, userId);
  }
}
