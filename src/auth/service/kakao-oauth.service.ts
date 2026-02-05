import axios from "axios";
import { UnauthorizedException } from "../../errors/error";

export class KakaoOAuthService {
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly clientSecret?: string;

  constructor() {
    const { KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, KAKAO_CLIENT_SECRET } =
      process.env;

    if (!KAKAO_CLIENT_ID || !KAKAO_REDIRECT_URI) {
      throw new Error("카카오 OAuth 환경변수가 누락되었습니다.");
    }

    this.clientId = KAKAO_CLIENT_ID;
    this.redirectUri = KAKAO_REDIRECT_URI;
    this.clientSecret = KAKAO_CLIENT_SECRET; // 선택사항
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

  // Authorization code로 Access Token 받기
  private async getAccessToken(code: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code,
      });

      if (this.clientSecret) {
        params.append("client_secret", this.clientSecret);
      }

      const response = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.error("Kakao Token Error:", error);
      throw new UnauthorizedException(
        "K001",
        "카카오 토큰 발급에 실패했습니다.",
      );
    }
  }

  // Access Token으로 사용자 정보 가져오기
  async getUserInfo(code: string) {
    try {
      const accessToken = await this.getAccessToken(code);

      const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { id, kakao_account } = response.data;

      // 이메일 검증 강화
      if (!kakao_account?.email || !id) {
        throw new UnauthorizedException(
          "K002",
          "카카오 사용자 정보를 가져올 수 없습니다.",
        );
      }

      // 이메일 인증 여부 확인 (보안 강화)
      if (!kakao_account.is_email_valid || !kakao_account.is_email_verified) {
        throw new UnauthorizedException(
          "K004",
          "인증되지 않은 이메일입니다. 카카오 계정에서 이메일 인증을 완료해주세요.",
        );
      }

      return {
        email: kakao_account.email,
        kakaoUid: id.toString(),
        nickname:
          kakao_account.profile?.nickname || kakao_account.email.split("@")[0],
      };
    } catch (error) {
      console.error("Kakao OAuth Error:", error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("K003", "카카오 인증에 실패했습니다.");
    }
  }
}
