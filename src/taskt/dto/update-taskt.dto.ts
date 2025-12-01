import { PartialType } from '@nestjs/swagger';
import { CreateTasktDto } from './create-taskt.dto';

export class UpdateTasktDto extends PartialType(CreateTasktDto) {}
