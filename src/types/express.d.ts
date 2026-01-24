import "express-serve-static-core";
import { JwtPayload } from "../auth/middleware/auth.middleware";


declare module "express-serve-static-core" {

  interface Request {
    user?: JwtPayload;
  }

  interface Response {
    success(data: any): this;
    error(payload: {
      errorCode: string | null;
      message: string | null;
      data: any;
    }): this;
  }
}

export { };
