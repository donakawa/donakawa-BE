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
import { SQSClient } from "@aws-sdk/client-sqs";
import { CrawlQueueClient } from "./wishlist/infra/crawl-queue.client";
import { ValkeyClient } from "./infra/valkey.client";
import { EventEmitterClient } from "./wishlist/infra/event-emitter.client";

const connectionString = `${process.env.DATABASE_URL}`;

// AWS Infra
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_SQS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SQS_SECRET_KEY!,
  },
});
const eventEmitterClient = new EventEmitterClient();
const valkeyClient = ValkeyClient.init(eventEmitterClient);

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
const crawlQueueClient = new CrawlQueueClient(sqsClient);
const wishlistRepository = new WishlistRepository(prisma);
const wishlistService = new WishlistService(
  wishlistRepository,
  crawlQueueClient,
  valkeyClient,
  eventEmitterClient,
);
const wishlist = {
  service: wishlistService,
  repository: wishlistRepository,
  infrastructure: {
    crawlQueueClient,
    eventEmitterClient,
  },
};

export const container = { prisma, auth, goals, histories, wishlist };
