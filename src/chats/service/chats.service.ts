import { ChatsRepository } from "../repository/chats.repository";
import {
  CreateChatResponse,
  ChatDetailResponse,
  ChatListResponse,
  FinishResponse,
  QuestionResponse,
  GptResultResponse,
} from "../dto/response/chats.response.dto";
import { QUESTIONS } from "../constants/questions";
import { SelectOptionRequest } from "../dto/request/chats.request.dto";
import { GptService } from "./gpt.service";
import { RedisService } from "./redis.service";

export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly gptService: GptService,
    private readonly redisService: RedisService,
  ) {}

  async createChat(
    userId: number,
    wishItemId: number,
  ): Promise<CreateChatResponse> {
    const chat = await this.chatsRepository.createChat(
      userId,
      `WishItem #${wishItemId}`,
    );

    return {
      id: Number(chat.id),
      currentStep: 1,
      createdAt: chat.createdAt.toISOString(),
    };
  }

  async getChats(userId: number): Promise<ChatListResponse[]> {
    const chats = await this.chatsRepository.findChatsByUser(userId);

    return chats.map((chat) => ({
      id: Number(chat.id),
      wishItemName: chat.title,
      createdAt: chat.createdAt.toISOString(),
    }));
  }

  async getChatDetail(chatId: number): Promise<ChatDetailResponse> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat) throw new Error("Chat not found");

    const userMessages = chat.aiChatMessage.filter((m) => m.sender === "USER");

    const aiMessage = chat.aiChatMessage.find((m) => m.sender === "AI");

    return {
      id: Number(chat.id),
      wishItem: {
        id: 12,
        name: "검은색 슬랙스",
        price: 89000,
      },
      answers: userMessages.map((m, i) => ({
        step: i + 1,
        selectedOption: m.content,
      })),
      result: aiMessage ? aiMessage.content : null,
      currentStep: userMessages.length + 1,
    };
  }

  // 현재 step 기준 질문 반환
  async getCurrentQuestion(
    chatId: number,
  ): Promise<QuestionResponse | { message: string }> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat) throw new Error("Chat not found");

    const answeredCount = chat.aiChatMessage.filter(
      (m) => m.sender === "USER",
    ).length;

    const nextStep = answeredCount + 1;

    if (nextStep > QUESTIONS.length) {
      return { message: "모든 질문이 완료되었습니다." };
    }

    return QUESTIONS.find((q) => q.step === nextStep)!;
  }

  async deleteChat(chatId: number): Promise<{ message: string }> {
    await this.chatsRepository.deleteChat(chatId);
    return { message: "채팅방이 삭제되었습니다." };
  }

  async saveSelection(
    chatId: number,
    body: SelectOptionRequest,
  ): Promise<FinishResponse> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat) throw new Error("Chat not found");

    const question = QUESTIONS.find((q) => q.step === body.step);
    if (!question) throw new Error("Invalid step");

    const option = question.options.find((o) => o.id === body.selectedOptionId);
    if (!option) throw new Error("Invalid option");

    await this.chatsRepository.createMessage(
      Number(chat.id),
      "USER",
      option.label,
    );

    if (body.step < QUESTIONS.length) {
      return { isFinished: false };
    }
    return { isFinished: true };
  }

  async gptChat(chatId: number): Promise<GptResultResponse> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat) throw new Error("Chat not found");

    const answers = chat.aiChatMessage
      .filter((m) => m.sender === "USER")
      .map((m) => m.content);

    const { decision, message } = await this.gptService.finishDecision({
      item: { name: "검은색 슬랙스", price: 89000 },
      user: { budgetLeft: 195500, daysUntilBudgetReset: 10 },
      answers,
    });

    /** 결과 테이블에 저장 */
    await this.chatsRepository.createChatResult({
      headerId: Number(chat.id),
      decision: decision === "구매 추천" ? "BUY" : "HOLD",
    });

    return {
      decision,
      message,
    };
  }
}
