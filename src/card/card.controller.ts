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
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
//import { AuthGuard } from 'src/auth/auth.guard';
import { ActiveUser } from 'src/common/active-user/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { Role } from 'src/auth/enums/role.enum';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}
  @Post()
  @Auth(Role.USER)
  create(@Body() createCardDto: CreateCardDto, @ActiveUser() user: any) {
    console.log('user', user);
    return this.cardService.createForUser(createCardDto, user.id);
  }
  @Auth(Role.USER)
  @Get()
  findAll(@ActiveUser() user: any) {
    return this.cardService.findAllByUser(user.id);
  }
  @Auth(Role.USER)
  @Get(':id')
  findOne(@Param('id') id: string, @ActiveUser() user: any) {
    return this.cardService.findOneForUser(+id, user.id);
  }
  @Auth(Role.USER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @ActiveUser() user: any,
  ) {
    return this.cardService.updateForUser(+id, dto, user.id);
  }
  @Auth(Role.USER)
  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: any) {
    return this.cardService.removeForUser(+id, user.id);
  }
}
