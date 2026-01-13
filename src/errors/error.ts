import { AppError } from "./app.error";

export class NotFoundException extends AppError {
  constructor(errorCode: string, message: string, data?: any) {
    super({
      errorCode,
      statusCode: 404,
      message,
      data,
    });
  }
}
export class UnauthorizedException extends AppError {
  constructor(errorCode: string, message: string, data?: any) {
    super({
      errorCode,
      statusCode: 401,
      message,
      data,
    });
  }
}
export class ConflictException extends AppError {
  constructor(errorCode: string, message: string, data?: any) {
    super({
      errorCode,
      statusCode: 409,
      message,
      data,
    });
  }
}
