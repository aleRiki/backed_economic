import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  create(createUserDto: CreateUserDto) {
   const user = this.usersRepository.create(createUserDto);
   
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
}
