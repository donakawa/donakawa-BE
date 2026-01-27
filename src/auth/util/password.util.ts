export class PasswordUtil {
  /**
   * 소셜 로그인 사용자인지 확인
   * password가 null이거나 빈 문자열이면 소셜 로그인 사용자
   */
  static isSocialUser(password: string | null): boolean {
    return !password || password === '';
  }

  /**
   * 일반 로그인 사용자인지 확인
   * password가 null이 아니고 빈 문자열이 아니면 일반 로그인 사용자
   */
  static hasPassword(password: string | null): boolean {
    return !!password && password !== '';
  }
}