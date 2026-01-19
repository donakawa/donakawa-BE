import { Route, Tags } from "tsoa";
import { container } from "../../container";
import { ChatsService } from "../service/chats.service";

@Route("/chats")
@Tags("Chats")
export class ChatsController {
  private readonly chatsService: ChatsService = container.chats.service;
}
