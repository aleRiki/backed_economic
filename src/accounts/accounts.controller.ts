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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { ActiveUser } from 'src/common/active-user/active-user.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}
  @Auth(Role.USER)
  @Post()
  create(@Body() createAccountDto: CreateAccountDto, @ActiveUser() user: any) {
    return this.accountsService.create(createAccountDto, user.id);
  }
  @Auth(Role.USER)
  @Get()
  findAll(@ActiveUser() user: any) {
    console.log(user, 'usuario desde el controlador de accounts');
    return this.accountsService.findByUser(user.id);
  }
  @Auth(Role.USER)
  @Get(':id')
  findOne(@Param('id') id: string, @ActiveUser() user: any) {
    return this.accountsService.findOneForUser(+id, user.id);
  }
  @Auth(Role.USER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @ActiveUser() user: any,
  ) {
    return this.accountsService.updateForUser(+id, updateAccountDto, user.id);
  }
  @Auth(Role.USER)
  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: any) {
    return this.accountsService.removeForUser(+id, user.id);
  }
}
