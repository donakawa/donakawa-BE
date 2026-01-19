import { ChatsRepository } from "../repository/chats.repository";

export class ChatsService {
  constructor(private readonly goalsRepository: ChatsRepository) {}
}
