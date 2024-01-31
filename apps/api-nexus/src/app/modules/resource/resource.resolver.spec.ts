import { Test, TestingModule } from '@nestjs/testing';
import { ResourceResolver } from './resource.resolver';
import { PrismaService } from '../../lib/prisma.service';
import { ResourceFilter, ResourceStatus } from '../../__generated__/graphql';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { GoogleYoutubeService } from '../../lib/googleAPI/googleYoutubeService';
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService';
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { BatchService } from '../../lib/batch/batchService';
// Import other dependencies used in your resolver

describe('ResourceResolver', () => {
  let resolver: ResourceResolver;
  let prismaService: PrismaService;
  let googleOAuthService: GoogleOAuthService;
  let googleYoutubeService: GoogleYoutubeService;
  let googleDriveService: GoogleDriveService;
  let cloudFlareService: CloudFlareService;
  let youtubeService: YoutubeService;
  let googleSheetsService: GoogleSheetsService;
  let batchService: BatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceResolver,
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
        {
          provide: GoogleDriveService,
          useValue: mockGoogleDriveService,
        },
        {
          provide: CloudFlareService,
          useValue: mockCloudFlareService,
        },
        {
          provide: YoutubeService,
          useValue: mockYoutubeService,
        },
        {
          provide: GoogleSheetsService,
          useValue: mockGoogleSheetsService,
        },
        {
          provide: BatchService,
          useValue: mockBatchService,
        },
      ],
    }).compile();

    resolver = module.get<ResourceResolver>(ResourceResolver);
    prismaService = module.get<PrismaService>(PrismaService);
    // Initialize other services used in your resolver
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  // Add tests for each resolver method (resources, resource, resourceCreate, etc.)

  // Example test for the 'resources' query
  describe('resources', () => {
    it('should return an array of resources', async () => {
      const mockUserId = 'test-user-id'; // Mock user ID
      const mockResourceFilter: ResourceFilter = {
        // Populate with appropriate mock data
        ids: ['some-id'],
        nexusId: 'test-nexusId',
        status: ResourceStatus.published,
        // ... other fields if required
      };
      const result = [
        /* mocked Resource data */
      ];
      jest.spyOn(prismaService.resource, 'findMany').mockResolvedValue(result);

      expect(await resolver.resources(mockUserId, mockResourceFilter)).toEqual(
        result,
      );
    });
  });

  // Add similar tests for the other methods
});

// Mocked PrismaService
const mockPrismaService = {
  resource: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Add other methods as required
  },
  // Add other models and methods as required
};

// Mock other services used in your resolver
// Mocked GoogleOAuthService
const mockGoogleOAuthService = {
  // Mock methods used in your resolver
};

// Mocked GoogleYoutubeService
const mockGoogleYoutubeService = {
  // Mock methods used in your resolver
};

// Mocked GoogleDriveService
const mockGoogleDriveService = {
  // Mock methods used in your resolver
};

// Mocked CloudFlareService
const mockCloudFlareService = {
  // Mock methods used in your resolver
};

// Mocked YoutubeService
const mockYoutubeService = {
  // Mock methods used in your resolver
};

// Mocked GoogleSheetsService
const mockGoogleSheetsService = {
  // Mock methods used in your resolver
};

// Mocked BatchService
const mockBatchService = {
  // Mock methods used in your resolver
};
