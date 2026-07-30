import { CharacterRepository } from "../repository/character.repository";
import { GoalsRepository } from "../../goals/repository/goals.repository";
import { MessageData } from "../types/message.type";
import { EquipItemRequestDto } from "../dto/request/character.request.dto";
import {
  HamsterTalkResponseDto,
  HamsterInfoResponseDto,
  ShopItemsResponseDto,
  CleanPooResponseDto,
} from "../dto/response/character.response.dto";
import { MessagePolicy } from "../policy/message.policy";
import { MessageId } from "../enums/message.enum";
import { ExpressionKey } from "../enums/expression.enum";
import { ItemCategory } from "@prisma/client";
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "../../errors/error";
import { FilesService } from "../../files/service/files.service";

export class CharacterService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly goalRepository: GoalsRepository,
    private readonly filesService: FilesService,
  ) {}

  private makeNextCycleDate(incomeDate: Date, originalIncomeDay: number): Date {
    const next = new Date(incomeDate);
    next.setMonth(next.getMonth() + 1);

    const lastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0,
    ).getDate();

    next.setDate(Math.min(originalIncomeDay, lastDay));

    return next;
  }

  private async createPoo(
    lastLoginAt: Date | null,
    currentPooCount: number,
    userId: string,
  ) {
    if (!lastLoginAt) {
      return;
    }

    const diffHours = (Date.now() - lastLoginAt.getTime()) / (1000 * 60 * 60);

    let createCount = 0;

    if (diffHours >= 72) {
      createCount = 1 + Math.floor((diffHours - 72) / 48);
    }

    if (createCount <= 0) {
      return;
    }

    const nextPooCount = Math.min(currentPooCount + createCount, 3);

    if (nextPooCount !== currentPooCount) {
      await this.characterRepository.updatePooCount(userId, nextPooCount);
    }
  }

  private getExpressionKey(messageId: MessageId): ExpressionKey {
    switch (messageId) {
      case MessageId.TALK_01:
      case MessageId.TALK_02:
        return ExpressionKey.TALK;

      case MessageId.BUD_03:
        return ExpressionKey.BUD;

      case MessageId.SAVE_01:
      case MessageId.SAVE_02:
      case MessageId.SAVE_03:
        return ExpressionKey.SAVE;

      default:
        return ExpressionKey.DEFAULT;
    }
  }

  private async getCurrentCondition(userId: string) {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const budget = await this.goalRepository.findBudgetByUserId(userId);

    let totalSpend = 0;
    let remainingBudget = 0;

    if (budget) {
      let nextIncomeDate = new Date(budget.incomeDate!);
      nextIncomeDate.setUTCHours(0, 0, 0, 0);

      const originalIncomeDay = budget.incomeDay ?? nextIncomeDate.getUTCDate();

      if (now >= nextIncomeDate) {
        nextIncomeDate = this.makeNextCycleDate(
          nextIncomeDate,
          originalIncomeDay,
        );
        nextIncomeDate.setUTCHours(0, 0, 0, 0);
      }

      const cycleStart = new Date(nextIncomeDate);
      cycleStart.setMonth(cycleStart.getMonth() - 1);
      cycleStart.setUTCHours(-9, 0, 0, 0);

      totalSpend = await this.goalRepository.getTotalSpendByUser(
        userId,
        cycleStart,
      );

      remainingBudget = budget
        ? Math.max((budget.shoppingBudget ?? 0) - totalSpend, 0)
        : 0;
    }

    const [user, goal, skippedPurchase] = await Promise.all([
      this.characterRepository.findUser(userId),
      this.characterRepository.findGoal(userId),
      this.characterRepository.findLatestSkipPurchase(userId),
    ]);
    const showGoalWelcome = Boolean(goal && !user?.goalWelcomeShown);
    const showGoalMonthlyWelcome = Boolean(
      goal &&
      budget &&
      now >= budget.incomeDate! &&
      (user?.lastGoalMonthlyWelcomeYear !== currentYear ||
        user?.lastGoalMonthlyWelcomeMonth !== currentMonth),
    );
    const lastLoginAt = user!.lastLoginAt;
    const showLoginGreeting = !user!.loginGreetingShown;
    const hamster = await this.characterRepository.findHamster(userId);

    await this.createPoo(user!.lastLoginAt, hamster!.pooCount, userId);

    const talkData: MessageData = {
      user,
      goal,
      budget,
      currentSpend: totalSpend,
      remainingBudget,
      skippedPurchase,
      showGoalWelcome,
      showGoalMonthlyWelcome,
      lastLoginAt,
      showLoginGreeting,
    };

    const talk = MessagePolicy.select(talkData);
    return {
      talk,
      currentYear,
      currentMonth,
    };
  }

  // 도나햄 한마디 조회
  async getHamsterTalk(userId: string): Promise<HamsterTalkResponseDto> {
    const { talk, currentYear, currentMonth } =
      await this.getCurrentCondition(userId);

    if (talk.id === MessageId.TALK_01 || talk.id === MessageId.TALK_02) {
      await this.characterRepository.updateLoginGreetingShown(userId);
    }

    if (talk.id === MessageId.GOAL_01) {
      await this.characterRepository.updateGoalWelcomeShown(userId);
    }

    if (talk.id === MessageId.GOAL_02) {
      await this.characterRepository.updateGoalMonthlyWelcome(
        userId,
        currentYear,
        currentMonth,
      );
    }

    await this.characterRepository.updateLastLoginAt(userId);

    return new HamsterTalkResponseDto({
      conditionId: talk.id,
      message: talk.message,
    });
  }

  // 햄꾸 화면 조회
  async getHamster(userId: string): Promise<HamsterInfoResponseDto> {
    const [user, hamster] = await Promise.all([
      this.characterRepository.findUserCoin(userId),
      this.characterRepository.findHamster(userId),
    ]);

    if (!hamster) {
      throw new NotFoundException("H001", "햄스터 정보를 찾을 수 없습니다.");
    }

    const [skinUrl, accessoryUrl, wallpaperUrl, floorUrl] = await Promise.all([
      this.filesService.generateS3Url(hamster.skin!.imagePath, 60 * 60),
      this.filesService.generateS3Url(hamster.accessory!.imagePath, 60 * 60),
      this.filesService.generateS3Url(hamster.wallpaper!.imagePath, 60 * 60),
      this.filesService.generateS3Url(hamster.floor!.imagePath, 60 * 60),
    ]);

    const { talk } = await this.getCurrentCondition(userId);
    const expression = this.getExpressionKey(talk.id);

    const skinImage = await this.characterRepository.findSkinImage(
      hamster.skinId!,
      expression,
    );
    if (!skinImage) {
      throw new NotFoundException("H002", "햄스터 정보를 찾을 수 없습니다.");
    }

    const hamsterImageUrl = await this.filesService.generateS3Url(
      skinImage.imagePath,
      60 * 60,
    );

    return new HamsterInfoResponseDto({
      coin: user!.coin,
      pooCount: hamster.pooCount,
      hamsterImageUrl,
      equipped: {
        skin: {
          itemId: Number(hamster.skin!.id),
          itemKey: hamster.skin!.itemKey,
          imageUrl: skinUrl!,
        },
        accessory: {
          itemId: Number(hamster.accessory!.id),
          itemKey: hamster.accessory!.itemKey,
          imageUrl: accessoryUrl!,
        },
        wallpaper: {
          itemId: Number(hamster.wallpaper!.id),
          itemKey: hamster.wallpaper!.itemKey,
          imageUrl: wallpaperUrl!,
        },
        floor: {
          itemId: Number(hamster.floor!.id),
          itemKey: hamster.floor!.itemKey,
          imageUrl: floorUrl!,
        },
      },
    });
  }

  // 햄꾸 카테고리별 아이템 조회
  async getShopItems(
    userId: string,
    category: ItemCategory,
  ): Promise<ShopItemsResponseDto> {
    const [hamster, items, ownedItems] = await Promise.all([
      this.characterRepository.findHamster(userId),
      this.characterRepository.findShopItems(category),
      this.characterRepository.findOwnedItems(userId),
    ]);

    if (!hamster) {
      throw new NotFoundException("H001", "햄스터 정보를 찾을 수 없습니다.");
    }

    const ownedSet = new Set(ownedItems.map((item) => Number(item.itemId)));

    let equippedId: bigint | null = null;

    switch (category) {
      case ItemCategory.SKIN:
        equippedId = hamster.skinId;
        break;

      case ItemCategory.ACCESSORY:
        equippedId = hamster.accessoryId;
        break;

      case ItemCategory.WALLPAPER:
        equippedId = hamster.wallpaperId;
        break;

      case ItemCategory.FLOOR:
        equippedId = hamster.floorId;
        break;
    }

    const responseItems = await Promise.all(
      items.map(async (item) => {
        const imageUrl = await this.filesService.generateS3Url(
          item.imagePath,
          60 * 60,
        );

        return {
          itemId: Number(item.id),
          name: item.name,
          price: item.price,
          imageUrl,
          owned: ownedSet.has(Number(item.id)) || item.isDefault,
          equipped: equippedId === item.id,
        };
      }),
    );

    return new ShopItemsResponseDto({
      items: responseItems,
    });
  }

  // 햄꾸 아이템 구매
  async purchaseShopItems(userId: string, itemId: number): Promise<void> {
    const [user, item] = await Promise.all([
      this.characterRepository.findUserForPurchase(userId),
      this.characterRepository.findUserItem(BigInt(itemId)),
    ]);

    if (!item) {
      throw new NotFoundException("S001", "아이템을 찾을 수 없습니다.");
    }

    if (item.isDefault) {
      throw new BadRequestException(
        "S002",
        "기본 아이템은 구매할 수 없습니다.",
      );
    }

    const owned = await this.characterRepository.findOwnedUserItem(
      user!.id,
      item.id,
    );

    if (owned || item.isDefault) {
      throw new ConflictException("S003", "이미 보유한 아이템입니다.");
    }

    if (user!.coin < item.price) {
      throw new BadRequestException("S004", "코인이 부족합니다.");
    }

    await this.characterRepository.purchaseItem(user!.id, item.id, item.price);
  }

  // 햄꾸 아이템 적용
  async equipShopItems(
    userId: string,
    body: EquipItemRequestDto,
  ): Promise<void> {
    const updates: {
      skinId?: bigint;
      accessoryId?: bigint;
      wallpaperId?: bigint;
      floorId?: bigint;
    } = {};

    const validateItem = async (
      itemId: number,
      category: ItemCategory,
    ): Promise<bigint> => {
      const item = await this.characterRepository.findUserItem(BigInt(itemId));

      if (!item) {
        throw new NotFoundException("S001", "아이템을 찾을 수 없습니다.");
      }

      if (item.category !== category) {
        throw new BadRequestException(
          "S005",
          "카테고리가 일치하지 않는 아이템입니다.",
        );
      }

      if (!item.isDefault) {
        const owned = await this.characterRepository.findOwnedUserItem(
          BigInt(userId),
          item.id,
        );

        if (!owned) {
          throw new BadRequestException("S006", "보유하지 않은 아이템입니다.");
        }
      }

      return item.id;
    };

    if (body.skinId !== undefined) {
      updates.skinId = await validateItem(body.skinId, ItemCategory.SKIN);
    }

    if (body.accessoryId !== undefined) {
      updates.accessoryId = await validateItem(
        body.accessoryId,
        ItemCategory.ACCESSORY,
      );
    }

    if (body.wallpaperId !== undefined) {
      updates.wallpaperId = await validateItem(
        body.wallpaperId,
        ItemCategory.WALLPAPER,
      );
    }

    if (body.floorId !== undefined) {
      updates.floorId = await validateItem(body.floorId, ItemCategory.FLOOR);
    }

    await this.characterRepository.equipItems(userId, updates);
  }

  // 청소 보상
  async cleanPoo(userId: string): Promise<CleanPooResponseDto> {
    const hamster = await this.characterRepository.findHamster(userId);
    const user = await this.characterRepository.cleanPoo(
      userId,
      hamster!.pooCount - 1,
    );

    return new CleanPooResponseDto({
      rewardCoin: 2,
      currentCoin: user.coin,
      pooCount: hamster!.pooCount - 1,
    });
  }
}
