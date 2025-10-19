import { Test, TestingModule } from '@nestjs/testing';
import { TascambController } from './tascamb.controller';
import { TascambService } from './tascamb.service';

describe('TascambController', () => {
  let controller: TascambController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TascambController],
      providers: [TascambService],
    }).compile();

    controller = module.get<TascambController>(TascambController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
