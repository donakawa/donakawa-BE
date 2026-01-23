import { google } from 'googleapis';
import { UnauthorizedException } from '../../errors/error';

export class GoogleOAuthService {
  private oauth2Client;

  constructor() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
      throw new Error("GOOGLE OAuth 환경변수가 누락되었습니다.");
    }
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL
    );
  }

  // Google 로그인 URL 생성
  getAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state,
    });
  }

  // Authorization code로 사용자 정보 가져오기
  async getUserInfo(code: string) {
    try {
      // Code를 Access Token으로 교환
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // 사용자 정보 가져오기
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      });

      const { data } = await oauth2.userinfo.get();

      if (!data.email || !data.id) {
        throw new UnauthorizedException(
          'G001',
          'Google 사용자 정보를 가져올 수 없습니다.'
        );
      }

      return {
        email: data.email,
        googleUid: data.id, // Google UID
        nickname: data.name || data.email.split('@')[0],
      };
    } catch (error) {
      console.error('Google OAuth Error:', error);
      throw new UnauthorizedException(
        'G002',
        'Google 인증에 실패했습니다.'
      );
    }
  }
}