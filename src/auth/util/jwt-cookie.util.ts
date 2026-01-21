import { Response } from "express";
type TokenCookieOptions = {
  accessToken: string;
  refreshToken: string;
};

export class JwtCookieUtil {
  static setJwtCookies(res: Response, tokens: TokenCookieOptions) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }
  static clearJwtCookies(res: Response) {
    const isProd = process.env.NODE_ENV === "production";
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    } as const;
    res.clearCookie("accessToken", base);
    res.clearCookie("refreshToken", base);
  }
   static setAccessTokenCookie(res: Response, accessToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
     res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1시간
     });
   }
}
