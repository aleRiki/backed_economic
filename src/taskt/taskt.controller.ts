import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TasktService } from './taskt.service';
import { CreateTasktDto } from './dto/create-taskt.dto';
import { UpdateTasktDto } from './dto/update-taskt.dto';
import { ActiveUser } from 'src/common/active-user/active-user.decorator';
//import { JwtAuthGuard } from ;
  import { Auth } from 'src/auth/decorators/auth.decorators';
import { Role } from 'src/auth/enums/role.enum';

@Controller('taskt')
@Auth(Role.USER) // protege todas las rutas
export class TasktController {
  constructor(private readonly tasktService: TasktService) {}

  @Post()
  create(@Body() dto: CreateTasktDto, @ActiveUser() user: any) {
    return this.tasktService.create(dto, user.id);
  }

  @Get()
  findAll(@ActiveUser() user: any) {
    return this.tasktService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @ActiveUser() user: any) {
    return this.tasktService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTasktDto, @ActiveUser() user: any) {
    return this.tasktService.update(+id, dto, user.id);
  }

  @Patch(':id/completed')
  complete(@Param('id') id: string, @ActiveUser() user: any) {
    return this.tasktService.markAsCompleted(+id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: any) {
    return this.tasktService.remove(+id, user.id);
  }
}