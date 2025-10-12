import {
  applyDecorators,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

import { Role } from './enums/role.enum';
import { Roles } from './decorators/roles.decorator';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { Auth } from './decorators/auth.decorators';

interface RequestWithUser extends Request {
  user: { email: string; role: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  profile(
    @Request()
    req: RequestWithUser,
  ) {
    return req.user;
  }
  @Get('profile2')
  @Auth(Role.ADMIN)
  profile2(
    @Request()
    req: RequestWithUser,
  ) {
    return req.user;
  }
}
