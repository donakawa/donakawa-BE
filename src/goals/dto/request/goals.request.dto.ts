import { IsInt, IsNotEmpty, IsOptional, IsIn, Min, Max } from "class-validator";
import { Example } from "tsoa";

export class GoalsRequestDto {
  @Example(100000)
  @IsInt()
  @IsNotEmpty()
  monthlyIncome!: number;

  @Example(7)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  incomeDate?: number;

  @Example(10000)
  @IsOptional()
  @IsInt()
  fixedExpense?: number;

  @Example(10000)
  @IsOptional()
  @IsInt()
  monthlySaving?: number;

  @Example(10000)
  @IsOptional()
  @IsInt()
  recommendSaving?: number;

  @Example(1)
  @IsInt()
  @IsIn([1, 2, 3])
  @IsNotEmpty()
  spendStrategy!: number;

  @Example(30000)
  @IsOptional()
  @IsInt()
  shoppingBudget?: number;
}
