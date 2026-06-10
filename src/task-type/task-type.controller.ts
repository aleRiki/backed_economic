import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaskTypeService } from './task-type.service';
import { CreateTaskTypeDto } from './dto/create-task-type.dto';
import { UpdateTaskTypeDto } from './dto/update-task-type.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { ActiveUser } from 'src/common/active-user/active-user.decorator';

@Controller('task-type')
@Auth(Role.USER)
export class TaskTypeController {
  constructor(private readonly taskTypeService: TaskTypeService) {}

  @Post()
  create(@Body() dto: CreateTaskTypeDto, @ActiveUser() user: any) {
    return this.taskTypeService.create(dto, user.id);
  }

  @Get()
  findAll(@ActiveUser() user: any) {
    return this.taskTypeService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @ActiveUser() user: any) {
    return this.taskTypeService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskTypeDto,
    @ActiveUser() user: any,
  ) {
    return this.taskTypeService.update(+id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: any) {
    return this.taskTypeService.remove(+id, user.id);
  }
}
