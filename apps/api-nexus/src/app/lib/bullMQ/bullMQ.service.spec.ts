import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { BatchService } from '../../modules/batch/batch.service'
import { FileService } from '../file/file.service'
import { SpreadSheetsService } from '../file/sheets.service'
import { GoogleOAuthService } from '../google/oauth.service'
import { PrismaService } from '../prisma.service'
import { BullMQService } from './bullMQ.service'
import {
  BatchStatus,
  BatchTask,
  PrivacyStatus,
  ResourceStatus
} from '.prisma/api-nexus-client'

describe('BullMQService', () => {
  let bullMQService: BullMQService
  let prismaService: DeepMockProxy<PrismaService>

  const mockChannel = {
    id: 'channel-1',
    name: 'Channel Name',
    connected: false,
    platform: 'youtube',
    createdAt: new Date(),
    deletedAt: null,
    title: null,
    description: null,
    youtubeId: 'youtube-id',
    imageUrl: null,
    updatedAt: null,
    publishedAt: null,
    resourceChannels: []
  }

  const mockResource = {
    id: 'resource-1',
    name: 'Resource One',
    category: null,
    language: null,
    customThumbnail: null,
    playlistId: null,
    isMadeForKids: false,
    mediaComponentId: null,
    notifySubscribers: false,
    videoMimeType: null,
    thumbnailMimeType: null,
    status: ResourceStatus.created,
    privacy: PrivacyStatus.private,
    createdAt: new Date(),
    updatedAt: null,
    publishedAt: null,
    deletedAt: null,
    resourceLocalizations: []
  }

  const mockBatchTask: BatchTask = {
    id: 'batch-task-1',
    batchId: 'batch-1',
    type: '',
    resourceId: 'resource-1',
    channelId: 'channel-1',
    progress: 0,
    error: null,
    status: 'completed',
    updatedAt: new Date(),
    createdAt: new Date()
  }

  const mockBatch = {
    id: 'batch-1',
    name: 'Batch One',
    status: BatchStatus.pending,
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    batchTasks: [mockBatchTask]
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BullMQService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        { provide: BullMQService, useValue: mockDeep<BullMQService>() },
        { provide: BatchService, useValue: mockDeep<BatchService>() },
        {
          provide: GoogleOAuthService,
          useValue: mockDeep<GoogleOAuthService>()
        },
        {
          provide: GoogleOAuthService,
          useValue: mockDeep<GoogleOAuthService>()
        },
        {
          provide: SpreadSheetsService,
          useValue: mockDeep<SpreadSheetsService>()
        },
        { provide: FileService, useValue: mockDeep<FileService>() }
      ]
    }).compile()

    bullMQService = module.get<BullMQService>(BullMQService)
    prismaService = module.get(PrismaService) as DeepMockProxy<PrismaService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createLocalizationBatch', () => {
    beforeEach(() => {
      prismaService.batch.create.mockResolvedValue(mockBatch)
      prismaService.channel.findFirst.mockResolvedValue(mockChannel)
      prismaService.resource.findMany.mockResolvedValue([mockResource])
    })

    it('should return null if resourceIds is empty', async () => {
      const result = await bullMQService.createLocalizationBatch(
        'token',
        'batch1',
        'channel1',
        []
      )
      expect(result).toBeUndefined()
    })
  })
})
