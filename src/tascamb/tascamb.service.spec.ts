import { Test, TestingModule } from '@nestjs/testing';
import { TascambService } from './tascamb.service';

describe('TascambService', () => {
  let service: TascambService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TascambService],
    }).compile();

    service = module.get<TascambService>(TascambService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
