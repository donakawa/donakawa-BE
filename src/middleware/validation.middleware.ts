import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../errors/error";

/**
 * Express 요청 body를 검증하는 미들웨어 생성 함수
 * 
 * @param type - 검증에 사용할 DTO 클래스 (예: CreateUserDto)
 * @returns Express 미들웨어 함수
 * 
 * @example @Middlewares(validateBody(VerifyEmailCodeRequestDto))
 */
export function validateBody(type: new () => any) {
  // type: new () => any 의미
  // - new 키워드로 호출 가능한 클래스
  // - 인자 없이 호출 가능
  // - 어떤 타입이든 반환 가능
  
  // 실제 Express에서 실행될 미들웨어 함수 반환
  return async (req: Request, res: Response, next: NextFunction) => {
    
    // 일반 객체(req.body)를 클래스 인스턴스로 변환
    // 각각의 객체에는 존재하지 않고 클래스 단위에만 validator 정보가 있음
    const dto = plainToInstance(type, req.body);
    
    // 변환된 DTO 인스턴스를 class-validator로 검증
    const errors = await validate(dto, {
      // whitelist: DTO 클래스에 정의되지 않은 속성 자동 제거
      // 예: DTO에 email, password만 있는데 role이 들어오면 제거
      whitelist: true,
      
      // forbidNonWhitelisted: whitelist에 없는 속성이 들어오면 에러 발생
      // true로 설정하면 정의되지 않은 속성 포함 시 422 에러
      forbidNonWhitelisted: true,
      
      // validationError: 에러 응답에서 제외할 정보 설정
      // target: 검증 대상 객체 자체를 응답에 포함하지 않음 (보안)
      // value: 잘못된 값을 응답에 포함하지 않음 (민감 정보 보호)
      validationError: { target: false, value: false },
    });
    
    //에러 형식 통일
    if (errors.length) {
      const error = new BadRequestException(
      "VALIDATION_ERROR",
      "요청 값이 올바르지 않습니다.",
      errors.map(err => ({
        property: err.property,
        constraints: err.constraints
      }))
    );
    throw error;
}   // 여기서 return하므로 아래 코드는 실행되지 않음
    
    // 검증 성공 시 req.body를 검증된 DTO 인스턴스로 교체
    // 이후 컨트롤러에서는 변환되고 검증된 DTO를 사용
    req.body = dto;
    
    // 다음 미들웨어 또는 라우트 핸들러로 진행
    next();
  };
}