export class HelloResponseDto {
  message!: string;
  static from(message: string) {
    const dto = new this();
    dto.message = message;
    return dto;
  }
}
