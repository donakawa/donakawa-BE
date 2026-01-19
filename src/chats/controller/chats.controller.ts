import { Body, Delete, Get, Path, Post, Route, Tags, Res } from "tsoa";
import type { Response as ExpressResponse } from "express";

import { container } from "../../container";
import { ChatsService } from "../service/chats.service";
import {
  CreateChatRequest,
  SelectOptionRequest,
} from "../dto/request/chats.request.dto";

@Route("/chats")
@Tags("Chats")
export class ChatsController {
  private readonly chatsService: ChatsService = container.chats.service;

  @Post()
  async createChat(@Body() body: CreateChatRequest) {
    return this.chatsService.createChat(1, body.wishItemId);
  }

  @Get()
  async getChats() {
    return this.chatsService.getChats(1);
  }

  @Get("/{id}")
  async getChatDetail(@Path() id: number) {
    return this.chatsService.getChatDetail(id);
  }

  @Get("/{id}/question")
  async getQuestion(@Path() id: number) {
    return this.chatsService.getCurrentQuestion(id);
  }

  @Post("/{id}/select")
  async selectOption(@Path() id: number, @Body() body: SelectOptionRequest) {
    return this.chatsService.saveSelection(id, body);
  }

  @Delete("/{id}")
  async deleteChat(@Path() id: number) {
    return this.chatsService.deleteChat(id);
  }

  @Get("/{id}/result/stream")
  async finishStream(
    @Path() id: number,
    @Res() res: ExpressResponse,
  ): Promise<void> {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await this.chatsService.streamFinish(id, res);
  }
}
