import { IsString } from "class-validator";

export class CreateBankDto {
    @IsString()
    name: string
    @IsString()
    address: string
}
