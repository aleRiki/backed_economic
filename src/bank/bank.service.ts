import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from './entities/bank.entity';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank) private bankRepository: Repository<Bank>,
  ) {}
  create(createBankDto: CreateBankDto) {
    return this.bankRepository.save(createBankDto);
  }

  findAll() {
    return this.bankRepository.find();
  }

  findOne(id: number) {
    return this.bankRepository.findOneBy({id});
  }

  update(id: number, updateBankDto: UpdateBankDto) {
    return this.bankRepository.update(id, updateBankDto);
  }

  remove(id: number) {
    return this.bankRepository.softDelete(id);
  }
}
