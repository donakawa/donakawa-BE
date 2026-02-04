import { ChatsRepository } from "../repository/chats.repository";
import { CreateChatRequest } from "../dto/request/chats.request.dto";
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

export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly gptService: GptService,
  ) {}

  async createChat(
    userId: number,
    body: CreateChatRequest,
  ): Promise<CreateChatResponse> {
    const { type, wishItemId } = body;

    const item = await this.chatsRepository.findChatItem(type, wishItemId);

    if (!item) throw new Error("Item not found");

    const chat = await this.chatsRepository.createChat({
      userId,
      itemType: type,
      itemId: wishItemId,
      title: item.name,
    });

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
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
    }));
  }

  async getChatDetail(chatId: number): Promise<ChatDetailResponse> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat) throw new Error("Chat not found");

    const userMessages = chat.aiChatMessage.filter((m) => m.sender === "USER");

    let wishItem;

    if (chat.itemType === "AUTO") {
      const product = chat.autoItem!.product;
      wishItem = {
        id: Number(product.id),
        name: product.name,
        price: product.price,
      };
    } else {
      const item = chat.manualItem!;
      wishItem = {
        id: Number(item.id),
        name: item.name,
        price: item.price,
      };
    }

    return {
      id: Number(chat.id),
      wishItem,
      answers: userMessages.map((m, i) => ({
        step: i + 1,
        selectedOption: m.content,
      })),
      result: chat.aiChatResult?.decision ?? null,
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

    const answeredCount = chat.aiChatMessage.filter(
      (m) => m.sender === "USER",
    ).length;
    if (body.step !== answeredCount + 1) {
      throw new Error("Invalid step order");
    }

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

  async resultChat(chatId: number): Promise<GptResultResponse> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat) throw new Error("Chat not found");

    const answers = chat.aiChatMessage
      .filter((m) => m.sender === "USER")
      .map((m) => m.content);

    const budget = chat.user.targetBudget.at(-1);

    const product = (() => {
      if (chat.autoItem) {
        return chat.autoItem.product;
      }

      if (chat.manualItem) {
        return {
          name: chat.manualItem.name,
          price: chat.manualItem.price,
        };
      }

      throw new Error("Chat item not found");
    })();

    const { decision, message } = await this.gptService.finishDecision({
      item: {
        name: product.name,
        price: product.price,
      },
      user: {
        budgetLeft: budget?.shoppingBudget ?? 0,
        daysUntilBudgetReset: 10,
      },
      answers,
    });

    await this.chatsRepository.createChatResult({
      headerId: Number(chat.id),
      decision,
    });

    return {
      decision,
      message,
    };
  }
}
