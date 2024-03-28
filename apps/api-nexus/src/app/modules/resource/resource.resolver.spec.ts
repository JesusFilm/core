import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { Resource, ResourceStatus, SourceType } from '.prisma/api-nexus-client';

import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import { BatchService } from '../batch/batchService';
import { BullMQService } from '../bullMQ/bullMQ.service';
import { GoogleDriveService } from '../google-drive/googleDriveService';

import { ResourceResolver } from './resource.resolver';

describe('ResourceResolver', () => {
  let resolver: ResourceResolver;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceResolver,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: GoogleOAuthService,
          useValue: mockDeep<GoogleOAuthService>(),
        },
        {
          provide: GoogleDriveService,
          useValue: mockDeep<GoogleDriveService>(),
        },
        { provide: CloudFlareService, useValue: mockDeep<CloudFlareService>() },
        { provide: YoutubeService, useValue: mockDeep<YoutubeService>() },
        { provide: BullMQService, useValue: mockDeep<BullMQService>() },
        {
          provide: GoogleSheetsService,
          useValue: mockDeep<GoogleSheetsService>(),
        },
        { provide: BatchService, useValue: mockDeep<BatchService>() },
      ],
    }).compile();

    resolver = module.get<ResourceResolver>(ResourceResolver);
    prismaService = module.get<PrismaService>(
      PrismaService,
    ) as DeepMockProxy<PrismaService>;
  });

  describe('resources', () => {
    it('should return an array of resources based on the filter', async () => {
      const userId = 'userId';
      const mockResources: Resource[] = [
        {
          id: 'resourceId',
          nexusId: 'nexusId',
          name: 'Resource Name',
          status: ResourceStatus.published,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          category: 'Example Category',
          privacy: null,
          sourceType: SourceType.other,
          // localizations: [],
          // resourceYoutubeChannel: [],
          // Include the missing properties with mock or null values as appropriate
          spokenLanguage: null, // Assuming this can be null
          customThumbnail: null, // Assuming this can be null
          notifySubscribers: null, // Assuming this can be null or provide a mock value
          playlistId: null, // Assuming this can be null or provide a mock value
          isMadeForKids: null, // Assuming this can be null or provide a mock value
          mediaComponentId: null, // Assuming this can be null or provide a mock value
          // Include other properties as needed, matching the 'Resource' model
        },
      ];
      prismaService.resource.findMany.mockResolvedValue(mockResources);

      const result = await resolver.resources(userId, {});
      expect(result).toEqual(mockResources);
      expect(prismaService.resource.findMany).toHaveBeenCalled();
    });
  });
});
