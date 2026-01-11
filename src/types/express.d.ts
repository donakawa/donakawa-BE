import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Response {
    success(data: any): this;
    error(payload: {
      errorCode: string | null;
      message: string | null;
      data: any;
    }): this;
  }
}

export {};
