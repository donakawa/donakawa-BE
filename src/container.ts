import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { AuthService } from "./auth/service/auth.service";
import { AuthRepository } from "./auth/repository/auth.repository";
import { GoalsRepository } from "./goals/repository/goals.repository";
import { GoalsService } from "./goals/service/goals.service";
import { HistoriesRepository } from "./histories/repository/histories.repository";
import { HistoriesService } from "./histories/service/histories.service";
import { WishlistRepository } from "./wishlist/repository/wishlist.repository";
import { WishlistService } from "./wishlist/service/wishlist.service";
import { ChatsRepository } from "./chats/repository/chats.repository";
import { ChatsService } from "./chats/service/chats.service";
import { GptService } from "./chats/service/gpt.service";

const connectionString = `${process.env.DATABASE_URL}`;

// Prisma Client
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Auth 도메인
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const auth = {
  service: authService,
  repository: authRepository,
};
// Goals 도메인
const goalsRepository = new GoalsRepository(prisma);
const goalsService = new GoalsService(goalsRepository);
const goals = {
  service: goalsService,
  repository: goalsRepository,
};
// Histories 도메인
const historiesRepository = new HistoriesRepository(prisma);
const historiesService = new HistoriesService(historiesRepository);
const histories = {
  service: historiesService,
  repository: historiesRepository,
};

// Wishlist 도메인
const wishlistRepository = new WishlistRepository(prisma);
const wishlistService = new WishlistService(wishlistRepository);
const wishlist = {
  service: wishlistService,
  repository: wishlistRepository,
};

// Chats 도메인
const chatsRepository = new ChatsRepository(prisma);
const gptService = new GptService();
const chatsService = new ChatsService(chatsRepository, gptService);
const chats = {
  service: chatsService,
  repository: chatsRepository,
};

export const container = { prisma, auth, goals, histories, wishlist, chats };
