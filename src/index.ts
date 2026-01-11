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

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  return res.status(err.statusCode).error({
    errorCode: err.errorCode,
    message: err.message,
    data: err.data,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
