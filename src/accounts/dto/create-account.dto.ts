import { IsNumber, IsString } from "class-validator";

export class CreateAccountDto {
    @IsString()
    name: string
    @IsString()
    type: string
    @IsNumber()
    balance: number
    @IsNumber()
    userId: number; 
    
    @IsNumber()
    bankId: number;
}
