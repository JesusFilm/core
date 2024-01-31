import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../lib/prisma.service';

import { NexusResolver } from './nexus.resolver';


describe('NexusResolver', () => {
  let resolver: NexusResolver;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NexusResolver,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<NexusResolver>(NexusResolver);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  // Example of a test for the 'nexuses' query
  describe('nexuses', () => {
    it('should return an array of nexuses', async () => {
      const result = [/* mocked Nexus data */];
      jest.spyOn(prismaService.nexus, 'findMany').mockResolvedValue(result);

      expect(await resolver.nexuses('userId', {})).toBe(result);
    });
  });

  // Add tests for nexus, nexusCreate, nexusUpdate, and nexusDelete methods similarly
});

// Mocked PrismaService
const mockPrismaService = {
  nexus: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(), // Add delete if used in your resolver
    // Add other methods as required
  },
  userNexus: {
    create: jest.fn(),
    // Add other methods as required
  },
  // Add other models as required
};
