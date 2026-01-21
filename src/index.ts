import "reflect-metadata";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { AppError } from "./errors/app.error.js";
import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";

import { RegisterRoutes } from "./tsoa/routes.js";
import { ValidateError } from "tsoa";
import { connectRedis, disconnectRedis } from "./infra/redis.client.js";
async function bootstrap() {
  await connectRedis();
  const app = express();
  const PORT = Number(process.env.PORT ?? 3000);

  app.set("trust proxy", 1);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.error = function ({ errorCode = null, message = null, data = null }) {
      return this.json({
        resultType: "FAILED",
        error: { errorCode, message, data },
        data: null,
      });
    };
    next();
  });

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));

  const swaggerPath = path.join(__dirname, "../dist/swagger.json");

  if (fs.existsSync(swaggerPath)) {
    const swaggerJson = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));
  }

  RegisterRoutes(app);

  function isTsoaValidateError(err: unknown): err is ValidateError {
    if (typeof err !== "object" || err === null) return false;
    if (!("fields" in err)) return false;
    const fields = (err as any).fields;
    if (typeof fields !== "object" || fields === null) return false;
    if ("message" in err && typeof (err as any).message !== "string")
      return false;
    if ("status" in err && typeof (err as any).status !== "number")
      return false;
    return true;
  }
  app.get("/health", (req, res) => res.status(200).send("OK"));
  app.use(
    (
      err: AppError | ValidateError,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (res.headersSent) return next(err);

      if (isTsoaValidateError(err)) {
        res.status(err.status).json({
          errorCode: "VALIDATION_ERROR",
          message: "요청 값이 올바르지 않습니다.",
          data: err.fields,
        });
      } else {
        res.status(err.statusCode ?? 500).error({
          errorCode: err.errorCode,
          message: err.message,
          data: err.data,
        });
      }
    },
  );

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectRedis();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
bootstrap();
