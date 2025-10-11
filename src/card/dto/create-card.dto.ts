import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  account: string;
}
