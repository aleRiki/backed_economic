import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PresupuestoService } from './presupuesto.service';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { ActiveUser } from 'src/common/active-user/active-user.decorator';

@Controller('presupuesto')
export class PresupuestoController {
  constructor(private readonly presupuestoService: PresupuestoService) {}

  @Auth(Role.USER)
@Post()
create(@Body() dto: CreatePresupuestoDto, @ActiveUser() user: any) {
  return this.presupuestoService.create(dto, user);
}

@Auth(Role.USER)
@Get()
findAll(@ActiveUser() user: any) {
  return this.presupuestoService.findAll(user);
}

@Auth(Role.USER)
@Get(':id')
findOne(@Param('id') id: string, @ActiveUser() user: any) {
  return this.presupuestoService.findOne(+id, user);
}

@Auth(Role.USER)
@Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdatePresupuestoDto, @ActiveUser() user: any) {
  return this.presupuestoService.update(+id, dto, user);
}

@Auth(Role.USER)
@Delete(':id')
remove(@Param('id') id: string, @ActiveUser() user: any) {
  return this.presupuestoService.remove(+id, user);
}

}
