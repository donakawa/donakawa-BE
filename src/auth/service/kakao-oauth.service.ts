import { OAuthLambdaClient } from "../infra/oauth-lambda.client";

export class KakaoOAuthService {
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly oauthLambdaClient = new OAuthLambdaClient();

  constructor() {
    const { KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI } = process.env;

    if (!KAKAO_CLIENT_ID || !KAKAO_REDIRECT_URI) {
      throw new Error("카카오 OAuth 환경변수가 누락되었습니다.");
    }

    this.clientId = KAKAO_CLIENT_ID;
    this.redirectUri = KAKAO_REDIRECT_URI;
  }

  // 카카오 로그인 URL 생성
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      state,
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  // 카카오 연결 끊기 (회원 탈퇴 시 호출)
  async unlinkUser(kakaoUid: string): Promise<void> {
    try {
      await this.oauthLambdaClient.unlinkKakaoUser(kakaoUid);
    } catch (error) {
      // 연결 끊기 실패가 탈퇴 자체를 막지 않도록 로그만 남김
      console.error("카카오 연결 끊기 실패:", error);
    }
  }

  // Access Token으로 사용자 정보 가져오기
  async getUserInfo(code: string) {
    return this.oauthLambdaClient.getKakaoUserInfo(code);
  }
}
