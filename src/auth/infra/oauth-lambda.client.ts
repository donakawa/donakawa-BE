import { Lambda } from "aws-sdk";
import {
  InfrastructureException,
  UnauthorizedException,
} from "../../errors/error";

type OAuthProvider = "GOOGLE" | "KAKAO";
type OAuthAction = "GET_USER_INFO" | "UNLINK_USER";

type OAuthLambdaPayload = {
  provider: OAuthProvider;
  action: OAuthAction;
  code?: string;
  kakaoUid?: string;
};

type OAuthLambdaResponse = {
  statusCode?: number;
  body?: string;
};

type OAuthLambdaErrorBody = {
  errorCode?: string;
  message?: string;
  detail?: unknown;
};

export type GoogleOAuthUserInfo = {
  email: string;
  googleUid: string;
  nickname: string;
};

export type KakaoOAuthUserInfo = {
  email: string;
  kakaoUid: string;
  nickname: string;
};

const oauthLambda = new Lambda({
  region: process.env.AWS_REGION ?? "ap-northeast-2",
  ...(process.env.AWS_LAMBDA_ACCESS_KEY && process.env.AWS_LAMBDA_SECRET_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_LAMBDA_ACCESS_KEY,
          secretAccessKey: process.env.AWS_LAMBDA_SECRET_KEY,
        },
      }
    : {}),
});

const OAUTH_LAMBDA_NAME =
  process.env.OAUTH_LAMBDA_NAME ?? "donakawa-oauth-lambda";

function stringifyPayload(payload: Lambda.InvocationResponse["Payload"]) {
  if (!payload) return undefined;
  return typeof payload === "string"
    ? payload
    : Buffer.from(payload as Buffer | Uint8Array).toString("utf-8");
}

function parsePayload(payload: Lambda.InvocationResponse["Payload"]) {
  if (!payload) {
    throw new InfrastructureException(
      "OAUTH_EMPTY_RESPONSE",
      "OAuth Lambda 응답이 비어 있습니다.",
    );
  }

  const rawPayload = stringifyPayload(payload);

  return JSON.parse(rawPayload!) as OAuthLambdaResponse;
}

function parseBody<T>(body?: string) {
  if (!body) return undefined;
  return JSON.parse(body) as T;
}

export class OAuthLambdaClient {
  async getGoogleUserInfo(code: string): Promise<GoogleOAuthUserInfo> {
    return this.invoke<GoogleOAuthUserInfo>({
      provider: "GOOGLE",
      action: "GET_USER_INFO",
      code,
    });
  }

  async getKakaoUserInfo(code: string): Promise<KakaoOAuthUserInfo> {
    return this.invoke<KakaoOAuthUserInfo>({
      provider: "KAKAO",
      action: "GET_USER_INFO",
      code,
    });
  }

  async unlinkKakaoUser(kakaoUid: string): Promise<void> {
    await this.invoke({
      provider: "KAKAO",
      action: "UNLINK_USER",
      kakaoUid,
    });
  }

  private async invoke<T>(payload: OAuthLambdaPayload): Promise<T> {
    const invokeResult = await oauthLambda
      .invoke({
        FunctionName: OAUTH_LAMBDA_NAME,
        InvocationType: "RequestResponse",
        Payload: JSON.stringify(payload),
      })
      .promise();

    if (invokeResult.FunctionError) {
      throw new InfrastructureException(
        "OAUTH_LAMBDA_ERROR",
        "OAuth Lambda 실행에 실패했습니다.",
        {
          functionError: invokeResult.FunctionError,
          payload: stringifyPayload(invokeResult.Payload),
        },
      );
    }

    const lambdaResponse = parsePayload(invokeResult.Payload);
    const statusCode = lambdaResponse.statusCode ?? 200;
    const body = parseBody<T | OAuthLambdaErrorBody>(lambdaResponse.body);

    if (statusCode < 200 || statusCode >= 300) {
      const errorBody = body as OAuthLambdaErrorBody | undefined;
      throw new UnauthorizedException(
        errorBody?.errorCode ?? "OAUTH_FAILED",
        errorBody?.message ?? "OAuth 인증에 실패했습니다.",
        {
          statusCode,
          body: errorBody,
        },
      );
    }

    return body as T;
  }
}
