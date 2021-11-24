import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResolver } from './response.resolver';

describe('ResponseResolver', () => {
  let resolver: ResponseResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseResolver],
    }).compile();

    resolver = module.get<ResponseResolver>(ResponseResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
