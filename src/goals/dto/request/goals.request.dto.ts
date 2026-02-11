import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  IsNumber,
  IsIn,
} from "class-validator";
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

  @Example(1)
  @IsInt()
  @IsIn([1, 2, 3], { message: "유효하지 않은 spendStrategy 값입니다." })
  spendStrategy!: number;

  @Example(30000)
  @IsInt()
  @IsNotEmpty()
  shoppingBudget!: number;
}

export class GoalsUpdateRequestDto {
  @IsOptional()
  @IsInt()
  monthlyIncome?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  incomeDate?: number;

  @IsOptional()
  @IsInt()
  fixedExpense?: number;

  @IsOptional()
  @IsInt()
  monthlySaving?: number;

  @IsOptional()
  @IsInt()
  shoppingBudget?: number;
}

export class CalcShoppingBudgetRequestDto {
  @Example(1000000)
  @IsInt()
  @IsNotEmpty()
  monthlyIncome!: number;

  @Example(300000)
  @IsOptional()
  @IsInt()
  fixedExpense?: number;

  @Example(200000)
  @IsOptional()
  @IsInt()
  monthlySaving?: number;

  @Example(1)
  @IsInt()
  @IsNotEmpty()
  @IsIn([1, 2, 3], { message: "유효하지 않은 spendStrategy 값입니다." })
  spendStrategy!: number;
}
