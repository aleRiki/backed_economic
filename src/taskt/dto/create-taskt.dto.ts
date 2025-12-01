import { IsBoolean, IsOptional, IsString, IsArray, IsNumber } from "class-validator";

export class CreateTasktDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  userIds?: number[]; 
}
