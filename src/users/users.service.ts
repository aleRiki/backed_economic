import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    const { rol, ...userData } = createUserDto;
    const user = this.usersRepository.create({
      ...userData,
      role: (rol as Role) || Role.USER,
    });
   
    return  this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

 async findOne(id: number) {
    return await this.usersRepository.findOneBy({id});
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
  }

 async remove(id: number) {
    return await this.usersRepository.softDelete(id);
  }
   async findOneByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }
  findOneByEmailWithPassword(email: string) {
  return this.usersRepository.findOne({
    where: { email },
    select: ['id', 'name', 'email', 'password', 'role'],
  });
}
}
