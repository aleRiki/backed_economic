import { Test, TestingModule } from '@nestjs/testing';
import { TasktService } from './taskt.service';

describe('TasktService', () => {
  let service: TasktService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasktService],
    }).compile();

    service = module.get<TasktService>(TasktService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
