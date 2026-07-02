export interface HamsterTalkInfo {
  conditionId: string;
  message: string;
}

export class HamsterTalkResponseDto {
  readonly conditionId: string;
  readonly message: string;

  constructor(entity: HamsterTalkInfo) {
    this.conditionId = entity.conditionId;
    this.message = entity.message;
  }
}
