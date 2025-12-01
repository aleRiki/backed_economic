import { Test, TestingModule } from '@nestjs/testing';
import { TasktController } from './taskt.controller';
import { TasktService } from './taskt.service';

describe('TasktController', () => {
  let controller: TasktController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasktController],
      providers: [TasktService],
    }).compile();

    controller = module.get<TasktController>(TasktController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
