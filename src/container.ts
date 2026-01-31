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
import { SQSClient } from "@aws-sdk/client-sqs";
import { CrawlQueueClient } from "./wishlist/infra/crawl-queue.client";
import { ValkeyClient } from "./infra/valkey.client";
import { EventEmitterClient } from "./wishlist/infra/event-emitter.client";
import { GoogleOAuthService } from "./auth/service/google-oauth.service";
import { FilesRepository } from "./files/repository/files.repository";
import { FilesService } from "./files/service/files.service";
import { S3StorageAdapter } from "./files/storage/s3.storage";
import { DbRepository } from "./infra/db.repository";

const connectionString = `${process.env.DATABASE_URL}`;
const googleOAuthService = new GoogleOAuthService();

// AWS Infra
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_SQS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SQS_SECRET_KEY!,
  },
});
const s3Client = new S3StorageAdapter({
  config: {
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
    },
  },
  bucketName: process.env.AWS_S3_BUCKET_NAME!,
});
const eventEmitterClient = new EventEmitterClient();
const valkeyClient = ValkeyClient.init(eventEmitterClient);

// Prisma Client
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const dbRepository = new DbRepository(prisma);

// Auth 도메인
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository, googleOAuthService, prisma);
const auth = {
  service: authService,
  repository: authRepository,
};

// Files 도메인
const filesRepository = new FilesRepository(prisma);
const filesService = new FilesService(filesRepository, s3Client);
const files = {
  service: filesService,
  repository: filesRepository,
  storage: s3Client,
};

// Goals 도메인
const goalsRepository = new GoalsRepository(prisma);
const goalsService = new GoalsService(goalsRepository, filesService);
const goals = {
  service: goalsService,
  repository: goalsRepository,
};

// Histories 도메인
const historiesRepository = new HistoriesRepository(prisma);
const historiesService = new HistoriesService(historiesRepository, filesService);
const histories = {
  service: historiesService,
  repository: historiesRepository,
};

// Wishlist 도메인
const crawlQueueClient = new CrawlQueueClient(sqsClient);
const wishlistRepository = new WishlistRepository(prisma);
const wishlistService = new WishlistService(
  dbRepository,
  wishlistRepository,
  crawlQueueClient,
  valkeyClient,
  eventEmitterClient,
  filesService,
  historiesService,
);
const wishlist = {
  service: wishlistService,
  repository: wishlistRepository,
  infrastructure: {
    crawlQueueClient,
    eventEmitterClient,
  },
};

// Chats 도메인
const chatsRepository = new ChatsRepository(prisma);
const gptService = new GptService();
const chatsService = new ChatsService(chatsRepository, gptService);
const chats = {
  service: chatsService,
  repository: chatsRepository,
};

export const container = {
  prisma,
  auth,
  goals,
  histories,
  wishlist,
  chats,
  files,
};
