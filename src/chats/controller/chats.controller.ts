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
   * 채팅 생성
   *
   * 위시 아이템을 기준으로 새로운 채팅 세션을 생성한다. (1개의 위시 아이템 당 1개의 채팅)
   */
  @Post()
  async createChat(
    @Body() body: CreateChatRequest,
    @Request() req: ExpressRequest,
  ) {
    const userId = Number(req.user!.id);

    return this.chatsService.createChat(userId, body.wishItemId);
  }

  /**
   * 사용자의 채팅 목록 조회
   */
  @Get()
  async getChats(@Request() req: ExpressRequest) {
    const userId = Number(req.user!.id);

    return this.chatsService.getChats(userId);
  }

  /**
   * 특정 채팅의 상세 정보 조회
   *
   * - 사용자가 선택한 답변 목록
   * - 현재 진행 단계
   * - 이미 생성된 AI 결과가 있다면 결과 내용
   */
  @Get("/{id}")
  async getChatDetail(@Path() id: number) {
    return this.chatsService.getChatDetail(id);
  }

  /**
   * 현재 채팅 단계에 해당하는 질문 조회
   */
  @Get("/{id}/question")
  async getQuestion(@Path() id: number) {
    return this.chatsService.getCurrentQuestion(id);
  }

  /**
   * 질문에 대한 사용자의 선택지 저장
   * 선택된 옵션은 사용자 메시지로 저장된다
   */
  @Post("/{id}/select")
  async selectOption(@Path() id: number, @Body() body: SelectOptionRequest) {
    return this.chatsService.saveSelection(id, body);
  }

  /**
   * 채팅 삭제
   */
  @Delete("/{id}")
  async deleteChat(@Path() id: number) {
    return this.chatsService.deleteChat(id);
  }

  /**
   * 채팅의 최종 결과 반환 (GPT)
   *
   * 모든 질문에 대한 답변이 완료된 후,
   * GPT를 통해 생성된 소비 결정 결과를 한 번에 반환한다.
   */
  @Get("/{id}/result")
  async resultChat(@Path() id: number) {
    return this.chatsService.resultChat(id);
  }
}
