import { Test, TestingModule } from '@nestjs/testing';
import { SignupResolver } from './signup.resolver';

describe('SignupResolver', () => {
  let resolver: SignupResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignupResolver],
    }).compile();

    resolver = module.get<SignupResolver>(SignupResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
