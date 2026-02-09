import { EmailVerifyTypeEnum } from "../enums/send-email.enum";
import { VerifyPasswordTypeEnum } from "../enums/verify-password.enum";

export const RedisKeys = {
  // 세션 관련
  userSid: (userId: bigint) => `user:${userId}:sid`,
  refreshToken: (sid: string) => `user:refreshToken:${sid}`,

  // 이메일 인증 관련
  emailVerifyCode: (type: EmailVerifyTypeEnum, email: string) =>
    `email:verify:${type}:${email}`,
  emailVerified: (type: EmailVerifyTypeEnum, email: string) =>
    `email:verified:${type}:${email}`,
  emailSendAttempt: (type: EmailVerifyTypeEnum, email: string) =>
    `email:send:attempt:${type}:${email}`,

  // 비밀번호 검증 관련
  passwordVerified: (type: VerifyPasswordTypeEnum, userId: bigint) =>
    `password:verified:${type}:${userId}`,
  passwordVerifyRateLimit: (type: VerifyPasswordTypeEnum, userId: bigint) =>
    `password:verify:rate:${type}:${userId}`,

  // 계정 탈퇴 관련(소셜)
  deleteAccountVerified: (userId: bigint) =>
    `delete-account:verified:${userId}`,

  // OAuth 관련
  oauthState: (state: string) => `oauth:state:${state}`,
} as const;

export const RedisTTL = {
  USER_SESSION: 60 * 60 * 24 * 7, // 리프레시 토큰, 세션 7일
  EMAIL_VERIFICATION_CODE: 60 * 5, // 인증 코드 입력 시간 5분
  EMAIL_VERIFIED: 60 * 10, // 인증 완료 상태 10분 유지
  OAUTH_STATE: 60 * 5, // OAuth 상태값 5분
  PASSWORD_VERIFIED: 60 * 5, // 비밀번호 검증 완료 상태 5분
  PASSWORD_RATE_LIMIT: 60 * 30, // 비밀번호 검증 시도 제한 30분
  EMAIL_SEND_ATTEMPT: 60 * 30, // 이메일 전송 시도 기록 30분
  DELETE_ACCOUNT_VERIFIED: 60 * 5, // 계정 탈퇴 본인 확인 상태 5분
} as const;
