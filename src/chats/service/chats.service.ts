import { ChatsRepository } from "../repository/chats.repository";
import { CreateChatRequest, SelectOptionRequest } from "../dto/request/chats.request.dto";
import {
  CreateChatResponse,
  ChatDetailResponse,
  ChatListResponse,
  FinishResponse,
  QuestionResponse,
  ResultResponse,
  ResultType,
} from "../dto/response/chats.response.dto";
import { QUESTIONS } from "../constants/questions";
import { Prisma } from "@prisma/client";
import { BadRequestException, NotFoundException } from "../../errors/error";
import { GoalsRepository } from "../../goals/repository/goals.repository";
import { FilesService } from "../../files/service/files.service";

type DecisionType = "구매 추천" | "구매 보류";

// option id 1=2점, 2=1점, 3=0점 → 총점 4점 이상이면 구매 추천
function computeDecision(selections: { content: string }[]): DecisionType {
  const score = selections.reduce((sum, sel) => {
    const optionId = parseInt(sel.content, 10);
    return sum + (3 - optionId);
  }, 0);
  return score >= 4 ? "구매 추천" : "구매 보류";
}

function computeResult(
  decision: DecisionType,
  remainingBudget: number,
  daysUntilReset: number,
  itemPrice: number,
): { resultType: ResultType; message: string } {
  const canAfford = remainingBudget >= itemPrice;
  const budgetFormatted = remainingBudget.toLocaleString("ko-KR");

  if (decision === "구매 추천") {
    if (canAfford) {
      return {
        resultType: "RECOMMEND_AFFORDABLE",
        message: `이 정도면 필요한 것 같아! 예산이\n${budgetFormatted}원 남았고 ${daysUntilReset}일 후 갱신돼!`,
      };
    }
    return {
      resultType: "RECOMMEND_OVER_BUDGET",
      message: `정말 필요한 거 맞아?\n이러다가 거지가 되게 생겼어`,
    };
  }

  if (canAfford) {
    return {
      resultType: "HOLD_AFFORDABLE",
      message: `꼭 필요하진 않아 보여... 예산이\n${budgetFormatted}원 남았고 ${daysUntilReset}일 후 갱신돼`,
    };
  }
  return {
    resultType: "HOLD_OVER_BUDGET",
    message: `사고 싶은 건 알겠지만... 예산이\n${budgetFormatted}원 남았고 ${daysUntilReset}일 더 참아야 해`,
  };
}

export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly goalsRepository: GoalsRepository,
    private readonly filesService: FilesService,
  ) {}

  async createChat(
    userId: number,
    body: CreateChatRequest,
  ): Promise<CreateChatResponse> {
    const { type, wishItemId } = body;

    const item = await this.chatsRepository.findChatItem(type, wishItemId);
    if (!item) throw new NotFoundException("C001", "존재하지 않는 위시 아이템입니다.");

    const chat = await this.chatsRepository.createChat({
      userId,
      itemType: type,
      itemId: wishItemId,
      title: item.name,
    });

    return {
      id: Number(chat.id),
      currentStep: 1,
      createdAt: chat.createdAt.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      }),
    };
  }

  async getChats(userId: number): Promise<ChatListResponse[]> {
    const chats = await this.chatsRepository.findChatsByUser(userId);

    return chats.map((chat) => ({
      id: Number(chat.id),
      title: chat.title,
      createdAt: chat.createdAt.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      }),
    }));
  }

  async getChatDetail(chatId: number, userId: number): Promise<ChatDetailResponse> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat || Number(chat.userId) !== userId)
      throw new NotFoundException("C002", "존재하지 않는 채팅방입니다.");

    const userMessages = chat.messages.filter((m) => m.sender === "USER");

    let wishItem;
    if (chat.itemType === "AUTO") {
      const autoItem = chat.autoItem!;
      const imageUrl = autoItem.product.photoFileId
        ? await this.filesService.generateUrl(autoItem.product.photoFileId.toString(), 60 * 60)
        : null;
      wishItem = {
        id: Number(autoItem.id),
        name: autoItem.product.name,
        price: autoItem.product.price,
        imageUrl,
      };
    } else {
      const item = chat.manualItem!;
      const imageUrl = item.photoFileId
        ? await this.filesService.generateUrl(item.photoFileId.toString(), 60 * 60)
        : null;
      wishItem = {
        id: Number(item.id),
        name: item.name,
        price: item.price,
        imageUrl,
      };
    }

    return {
      id: Number(chat.id),
      wishItem,
      answers: userMessages.map((m, i) => ({
        step: i + 1,
        selectedOption: m.content,
      })),
      result: chat.result?.decision ?? null,
      currentStep: userMessages.length + 1,
    };
  }

  async getCurrentQuestion(
    chatId: number,
    userId: number,
  ): Promise<QuestionResponse | { message: string }> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat || Number(chat.userId) !== userId)
      throw new NotFoundException("C002", "존재하지 않는 채팅방입니다.");

    const answeredCount = chat.messages.filter(
      (m) => m.sender === "USER",
    ).length;

    const nextStep = answeredCount + 1;
    if (nextStep > QUESTIONS.length) {
      return { message: "모든 질문이 완료되었습니다." };
    }

    return QUESTIONS.find((q) => q.step === nextStep)!;
  }

  async saveSelection(
    chatId: number,
    userId: number,
    body: SelectOptionRequest,
  ): Promise<FinishResponse> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat || Number(chat.userId) !== userId)
      throw new NotFoundException("C002", "존재하지 않는 채팅방입니다.");

    const answeredCount = chat.messages.filter((m) => m.sender === "USER").length;
    if (body.step !== answeredCount + 1) {
      throw new BadRequestException("C003", "올바르지 않은 질문 순서입니다.");
    }

    const question = QUESTIONS.find((q) => q.step === body.step);
    if (!question) throw new BadRequestException("C003", "올바르지 않은 질문 순서입니다.");

    const option = question.options.find((o) => o.id === body.selectedOptionId);
    if (!option) throw new BadRequestException("C004", "유효하지 않은 선택지입니다.");

    try {
      await this.chatsRepository.saveSelectionTx({
        headerId: Number(chat.id),
        step: body.step,
        content: String(body.selectedOptionId),
        optionLabel: option.label,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new BadRequestException("C003", "이미 처리된 요청입니다.");
      }
      throw e;
    }

    return { isFinished: body.step >= QUESTIONS.length };
  }

  async resultChat(chatId: number, userId: number): Promise<ResultResponse> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat || Number(chat.userId) !== userId)
      throw new NotFoundException("C002", "존재하지 않는 채팅방입니다.");

    const selections = chat.selections.sort((a, b) => a.step - b.step);
    if (selections.length < QUESTIONS.length) {
      throw new BadRequestException("C005", "아직 모든 질문에 답하지 않았습니다.");
    }

    const budget = chat.user.targetBudget;
    if (!budget || !budget.incomeDate) {
      throw new NotFoundException("C006", "등록된 목표 예산이 없습니다.");
    }

    const now = new Date();
    const nextIncomeDate = budget.incomeDate;
    const daysUntilReset = Math.max(
      Math.ceil((nextIncomeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      0,
    );

    const cycleStart = new Date(nextIncomeDate);
    cycleStart.setMonth(cycleStart.getMonth() - 1);

    const totalSpend = await this.goalsRepository.getTotalSpendByUser(
      chat.user.id.toString(),
      cycleStart,
    );
    const remainingBudget = (budget.shoppingBudget ?? 0) - totalSpend;

    const itemPrice = chat.autoItem?.product.price ?? chat.manualItem?.price ?? 0;

    const decision = computeDecision(selections);
    const { resultType, message } = computeResult(decision, remainingBudget, daysUntilReset, itemPrice);

    if (!chat.result) {
      await this.chatsRepository.createChatResult({
        headerId: Number(chat.id),
        decision,
      });
    }

    return { resultType, decision, message };
  }

  async deleteChat(chatId: number, userId: number): Promise<{ message: string }> {
    const chat = await this.chatsRepository.findChatDetail(chatId);
    if (!chat || Number(chat.userId) !== userId)
      throw new NotFoundException("C002", "존재하지 않는 채팅방입니다.");

    await this.chatsRepository.deleteChat(chatId);
    return { message: "채팅방이 삭제되었습니다." };
  }
}
