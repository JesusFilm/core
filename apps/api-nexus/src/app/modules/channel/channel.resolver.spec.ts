import { Test, TestingModule } from '@nestjs/testing';

import { ChannelFilter } from '../../__generated__/graphql'; // Adjust the import path as needed
import { GoogleYoutubeService } from '../../lib/googleAPI/googleYoutubeService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';

import { ChannelResolver } from './channel.resolver';

describe('ChannelResolver', () => {
  let resolver: ChannelResolver;
  let prismaService: PrismaService;
  let googleOAuthService: GoogleOAuthService;
  let googleYoutubeService: GoogleYoutubeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelResolver,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: GoogleOAuthService,
          useValue: mockGoogleOAuthService,
        },
        {
          provide: GoogleYoutubeService,
          useValue: mockGoogleYoutubeService,
        },
      ],
    }).compile();

    resolver = module.get<ChannelResolver>(ChannelResolver);
    prismaService = module.get<PrismaService>(PrismaService);
    googleOAuthService = module.get<GoogleOAuthService>(GoogleOAuthService);
    googleYoutubeService =
      module.get<GoogleYoutubeService>(GoogleYoutubeService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  // Add tests for each resolver method (channels, channel, channelCreate, etc.)

  // Example test for the 'channels' query
  describe('channels', () => {
    it('should return an array of channels', async () => {
      const mockUserId = 'test-user-id'; // Mock user ID
      const mockChannelFilter: ChannelFilter = {
        // Populate with appropriate mock data
        ids: ['some-id'],
        name: 'test-name',
        nexusId: 'test-nexusId',
        // ... other fields if required
      };
      const result = [
        /* mocked Channel data */
      ];
      jest.spyOn(prismaService.channel, 'findMany').mockResolvedValue(result);

      expect(await resolver.channels(mockUserId, mockChannelFilter)).toEqual(
        result,
      );
    });
  });

  // Add similar tests for the other methods
});

// Mocked PrismaService
const mockPrismaService = {
  channel: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Add other methods as required
  },
  // Add other models and methods as required
};

// Mocked GoogleOAuthService
const mockGoogleOAuthService = {
  // Mock methods used in your resolver
};

// Mocked GoogleYoutubeService
const mockGoogleYoutubeService = {
  // Mock methods used in your resolver
};
