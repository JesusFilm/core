import { Test, TestingModule } from '@nestjs/testing';
import { VideoResolvers } from './video.resolver';

describe('VideoResolver', () => {
  let resolver: VideoResolvers;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoResolvers],
    }).compile();

    resolver = module.get<VideoResolvers>(VideoResolvers);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
