import { Test, TestingModule } from '@nestjs/testing';
import { ActionResolver } from './action.resolver';

describe('ActionResolver', () => {
  let resolver: ActionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionResolver],
    }).compile();

    resolver = module.get<ActionResolver>(ActionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
