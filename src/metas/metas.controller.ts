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
import { MetasService } from './metas.service';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { ActiveUser } from 'src/common/active-user/active-user.decorator';

@Controller('metas')
export class MetasController {
  constructor(private readonly metasService: MetasService) {}
  @Post()
  @Auth(Role.USER)
  create(@Body() createMetaDto: CreateMetaDto, @ActiveUser() user: any) {
    return this.metasService.create(createMetaDto, user.id);
  }
  @Auth(Role.USER)
  @Get()
  findAll(@ActiveUser() user: any) {
    return this.metasService.findAll(user);
  }

  @Auth(Role.USER)
  @Get(':id')
  findOne(@Param('id') id: string, @ActiveUser() user: any) {
    return this.metasService.findOne(+id, user);
  }

  @Auth(Role.USER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetaDto: UpdateMetaDto,
    @ActiveUser() user: any,
  ) {
    return this.metasService.update(+id, updateMetaDto, user);
  }

  @Auth(Role.USER)
  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: any) {
    return this.metasService.remove(+id, user);
  }
}
