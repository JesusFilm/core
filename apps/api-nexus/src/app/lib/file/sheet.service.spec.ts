import { Test, TestingModule } from '@nestjs/testing'
import { BatchService } from '../../modules/batch/batch.service'
import { BullMQService } from '../bullMQ/bullMQ.service'
import { PrismaService } from '../prisma.service'
import { SpreadSheetsService, SpreadsheetRow } from './sheets.service'

describe('SpreadSheetsService', () => {
  let service: SpreadSheetsService
  let prismaService: PrismaService
  let _bullMQService: BullMQService
  let _batchService: BatchService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpreadSheetsService,
        {
          provide: PrismaService,
          useValue: {
            channel: {
              findFirst: jest.fn()
            },
            resource: {
              findFirst: jest.fn(),
              create: jest.fn()
            }
          }
        },
        {
          provide: BullMQService,
          useValue: {
            createUploadResourceBatch: jest.fn(),
            createLocalizationBatch: jest.fn()
          }
        },
        {
          provide: BatchService,
          useValue: {
            createUpdateResourcesLocalization: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<SpreadSheetsService>(SpreadSheetsService)
    prismaService = module.get<PrismaService>(PrismaService)
    _bullMQService = module.get<BullMQService>(BullMQService)
    _batchService = module.get<BatchService>(BatchService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('SpreadSheetTemplateData', () => {
    it('should populate channelData and resourceData for provided spreadsheet rows', async () => {
      const data: SpreadsheetRow[] = [
        {
          channel: 'test-channel-id',
          videoId: 'test-video-id'
        }
      ]

      prismaService.channel.findFirst = jest.fn().mockResolvedValue({
        id: 'channel-id',
        resourceChannels: [
          { channel: { id: 'channel-id' }, resourceId: 'resource-id' }
        ]
      })

      prismaService.resource.findFirst = jest.fn().mockResolvedValue({
        id: 'resource-id',
        resourceChannels: [
          {
            channel: { id: 'channel-id' },
            resourceId: 'resource-id',
            youtubeId: 'test-video-id'
          }
        ]
      })

      const result = await service.getSpreadSheetTemplateData({ data })

      expect(prismaService.channel.findFirst).toHaveBeenCalledTimes(3)
      expect(prismaService.resource.findFirst).toHaveBeenCalledTimes(1)
      expect(result.spreadsheetData[0].channelData).toEqual({
        id: 'channel-id'
      })
      expect(result.spreadsheetData[0].resourceData).toEqual({
        id: 'resource-id',
        resourceChannels: [
          {
            channel: { id: 'channel-id' },
            resourceId: 'resource-id',
            youtubeId: 'test-video-id'
          }
        ]
      })
    })
  })
})
