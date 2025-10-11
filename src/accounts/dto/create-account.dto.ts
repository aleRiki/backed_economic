import { IsNumber, IsString } from "class-validator";

export class CreateAccountDto {
    @IsString()
    name: string
    @IsString()
    type: string
    @IsNumber()
    balance: number
    @IsString()
    User: string
    @IsString()
    Bank: string
}
