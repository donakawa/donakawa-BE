import { LogService } from "./log/service/log.service";
import { LogRepository } from "./log/repository/log.repository";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { AuthService } from "./auth/service/auth.service";
import { AuthRepository } from "./auth/repository/auth.repository";
import { GoalsRepository } from "./goals/repository/goals.repository";
import { GoalsService } from "./goals/service/goals.service";
import { WishlistRepository } from "./wishlist/repository/wishlist.repository";
import { WishlistService } from "./wishlist/service/wishlist.service";
import { ChatsRepository } from "./chats/repository/chats.repository";
import { ChatsService } from "./chats/service/chats.service";
import { TournamentsRepository } from "./tournaments/repository/tournaments.repository";
import { TournamentsService } from "./tournaments/service/tournaments.service";
import { AttendanceRepository } from "./attendance/repository/attendance.repository";
import { AttendanceService } from "./attendance/service/attendance.service";
import { CharacterRepository } from "./character/repository/character.repository";
import { CharacterService } from "./character/service/character.service";
import { SQSClient } from "@aws-sdk/client-sqs";
import { CrawlQueueClient } from "./wishlist/infra/crawl-queue.client";
import { ValkeyClient } from "./infra/valkey.client";
import { EventEmitterClient } from "./wishlist/infra/event-emitter.client";
import { GoogleOAuthService } from "./auth/service/google-oauth.service";
import { FilesRepository } from "./files/repository/files.repository";
import { FilesService } from "./files/service/files.service";
import { S3StorageAdapter } from "./files/storage/s3.storage";
import { DbRepository } from "./infra/db.repository";
import { KakaoOAuthService } from "./auth/service/kakao-oauth.service";

const connectionString = `${process.env.DATABASE_URL}`;
const googleOAuthService = new GoogleOAuthService();
const kakaoOAuthService = new KakaoOAuthService();

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
const authService = new AuthService(
  authRepository,
  googleOAuthService,
  kakaoOAuthService,
  prisma,
);
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
const goalsService = new GoalsService(goalsRepository);
const goals = {
  service: goalsService,
  repository: goalsRepository,
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
const chatsService = new ChatsService(
  chatsRepository,
  goalsRepository,
  filesService,
);
const chats = {
  service: chatsService,
  repository: chatsRepository,
};

// Tournaments 도메인
const tournamentsRepository = new TournamentsRepository(prisma);
const tournamentsService = new TournamentsService(
  tournamentsRepository,
  filesService,
);
const tournaments = {
  service: tournamentsService,
  repository: tournamentsRepository,
};

// Log 도메인
const logRepository = new LogRepository(prisma);
const logService = new LogService(logRepository);
const log = {
  service: logService,
  repository: logRepository,
};

// Attendance 도메인
const attendanceRepository = new AttendanceRepository(prisma);
const attendanceService = new AttendanceService(attendanceRepository);
const attendance = {
  service: attendanceService,
  repository: attendanceRepository,
};

// Character 도메인
const characterRepository = new CharacterRepository(prisma);
const characterService = new CharacterService(
  characterRepository,
  goalsRepository,
);
const character = {
  service: characterService,
  repository: characterRepository,
};

export const container = {
  prisma,
  auth,
  goals,
  wishlist,
  chats,
  tournaments,
  files,
  log,
  attendance,
  character,
};
