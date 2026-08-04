import { OAuthLambdaClient } from "../infra/oauth-lambda.client";

export class GoogleOAuthService {
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly oauthLambdaClient = new OAuthLambdaClient();

  constructor() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CALLBACK_URL) {
      throw new Error("GOOGLE OAuth 환경변수가 누락되었습니다.");
    }

    this.clientId = GOOGLE_CLIENT_ID;
    this.redirectUri = GOOGLE_CALLBACK_URL;
  }

  // Google 로그인 URL 생성
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Authorization code로 사용자 정보 가져오기
  async getUserInfo(code: string) {
    return this.oauthLambdaClient.getGoogleUserInfo(code);
  }
}
