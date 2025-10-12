import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";

import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService
    , private readonly jwtService: JwtService
  ) {}

  async register({ password, email, name }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.usersService.create({
      name,
      email,
      password: hashedPassword,
    });

    return {
      message: "User created successfully",
    };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException("Invalid email");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid password");

    }
    const payload = { email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
        token: token,
      email: user.email,
    };
  }
}