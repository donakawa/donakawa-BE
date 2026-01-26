import { Request } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../../errors/error";

export interface JwtPayload {
    id: string;
    email: string;
    nickname: string;
    sid: string;
}

/**
 * TSOA authentication 함수
 * @Security("jwt") 데코레이터가 붙은 엔드포인트에서 자동으로 실행됨
 */
export async function expressAuthentication(
    request: Request,
    securityName: string,
    scopes?: string[] //규약 및 확장성을 위해 유지
): Promise<JwtPayload> {
    if (securityName !== "jwt") {
        throw new UnauthorizedException("A011", "지원하지 않는 인증 방식입니다.");
    }

    const token =
        request.cookies?.accessToken ||
        (request.headers.authorization?.startsWith("Bearer ")
            ? request.headers.authorization.substring(7)
            : undefined);
    if (!token) {
        throw new UnauthorizedException("A004", "인증 토큰이 없습니다.");
    }

    // JWT 검증
    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET_KEY!
        ) as JwtPayload;

        (request as any).user = decoded;

        return decoded;

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedException("A005", "토큰이 만료되었습니다.");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedException("A006", "유효하지 않은 토큰입니다.");
        }
        throw new UnauthorizedException("A007", "인증에 실패했습니다.");
    }
}