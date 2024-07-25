import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { PrismaService } from '../../lib/prisma.service'
import { BatchService } from './batch.service'

import { SpreadsheetRow } from '../../lib/file/sheets.service'
import { PrivacyStatus, ResourceStatus } from '.prisma/api-nexus-client'
describe('BatchService', () => {
  let prismaService: DeepMockProxy<PrismaService>
  let batchService: BatchService
  const resource = {
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

  const spreadsheetRow: SpreadsheetRow = {
    videoId: 'resource-video-1'
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() }
      ]
    }).compile()
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    batchService = module.get<BatchService>(BatchService)
  })

  describe('Update Resource Localizations', () => {
    beforeEach(() => {
      prismaService.resource.findFirst.mockResolvedValue(resource)
    })

    it('Create update localization batches', () => {
      expect(batchService.createUpdateResourcesLocalization([spreadsheetRow]))
    })
  })
})
