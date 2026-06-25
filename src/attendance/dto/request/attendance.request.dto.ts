import { IsInt, IsOptional, Max, Min } from "class-validator";

export class AttendanceQueryDto {
  // @IsOptional()
  year?: number;

  // @IsOptional()
  month?: number;
}
