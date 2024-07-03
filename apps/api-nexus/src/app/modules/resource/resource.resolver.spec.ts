import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, Resource, ResourceStatus } from '.prisma/api-nexus-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { PrivacyStatus } from '../../__generated__/graphql'
import { BullMQService } from '../../lib/bullMQ/bullMQ.service'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService'
import { FileService } from '../../lib/file/file.service'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import { SpreadSheetsService } from '../../lib/file/sheets.service'
import { GoogleYoutubeService } from '../../lib/google/youtube.service'
import { PrismaService } from '../../lib/prisma.service'

import { ResourceResolver } from './resource.resolver'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('ResourceResolver', () => {
  let resolver: ResourceResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const resource: Resource = {
    id: 'resourceId',
    name: 'Resource Name',
    status: ResourceStatus.created,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    category: 'Example Category',
    privacy: PrivacyStatus.private,
    language: null,
    customThumbnail: null,
    isMadeForKids: false,
    playlistId: null,
    mediaComponentId: null,
    notifySubscribers: false,
    publishedAt: null,
    videoMimeType: null,
    thumbnailMimeType: null
  }
  const resourceWithNexusUserNexus = {
    ...resource
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        ResourceResolver,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: GoogleOAuthService,
          useValue: mockDeep<GoogleOAuthService>()
        },
        {
          provide: FileService,
          useValue: mockDeep<FileService>()
        },
        {
          provide: SpreadSheetsService,
          useValue: mockDeep<SpreadSheetsService>()
        },
        {
          provide: GoogleYoutubeService,
          useValue: mockDeep<GoogleYoutubeService>()
        },
        { provide: CloudFlareService, useValue: mockDeep<CloudFlareService>() },
        { provide: BullMQService, useValue: mockDeep<BullMQService>() }
      ]
    }).compile()

    resolver = module.get<ResourceResolver>(ResourceResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('resources', () => {
    const accessibleResources: Prisma.ResourceWhereInput = { OR: [{}] }

    beforeEach(() => {
      prismaService.resource.findMany.mockResolvedValueOnce([resource])
    })

    it('returns resources', async () => {
      expect(await resolver.resources(accessibleResources)).toEqual([resource])
      expect(prismaService.resource.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleResources, {}]
        },
        orderBy: { createdAt: 'desc' },
        include: { resourceLocalizations: true }
      })
    })

    it('returns resources with filter', async () => {
      const filter = { ids: ['resourceId'] }
      expect(await resolver.resources(accessibleResources, filter)).toEqual([
        resource
      ])
      expect(prismaService.resource.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleResources, { id: { in: ['resourceId'] } }]
        },
        orderBy: { createdAt: 'desc' },
        include: { resourceLocalizations: true }
      })
    })

    it('returns resources with take', async () => {
      const filter = { limit: 1 }
      expect(await resolver.resources(accessibleResources, filter)).toEqual([
        resource
      ])
      expect(prismaService.resource.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleResources, {}]
        },
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: { resourceLocalizations: true }
      })
    })
  })

  describe('resource', () => {
    it('returns resource', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce(
        resourceWithNexusUserNexus
      )
      expect(await resolver.resource(ability, 'resourceId')).toEqual(
        resourceWithNexusUserNexus
      )
      expect(prismaService.resource.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'resourceId'
        },
        include: {
          resourceLocalizations: true
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce(null)
      await expect(resolver.resource(ability, 'resourceId')).rejects.toThrow(
        'resource not found'
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce({
        ...resource,
        deletedAt: new Date()
      })
      await expect(resolver.resource(ability, 'resourceId')).rejects.toThrow(
        'user is not allowed to view resource'
      )
    })
  })

  describe('resourceCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a resource', async () => {
      prismaService.resource.create.mockResolvedValueOnce(resource)
      prismaService.resource.findUnique.mockResolvedValue(
        resourceWithNexusUserNexus
      )
      mockUuidv4.mockReturnValueOnce('resourceId')
      expect(
        await resolver.resourceCreate(ability, {
          name: 'New Resource'
        })
      ).toEqual(resourceWithNexusUserNexus)
      expect(prismaService.resource.create).toHaveBeenCalledWith({
        data: {
          id: 'resourceId',
          name: 'New Resource',
          status: 'created'
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.resource.create.mockResolvedValueOnce(resource)
      prismaService.resource.findUnique.mockResolvedValue(null)
      await expect(
        resolver.resourceCreate(ability, {
          name: 'New Resource'
        })
      ).rejects.toThrow('resource not found')
    })
  })

  describe('resourceUpdate', () => {
    it('updates a resource', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce(
        resourceWithNexusUserNexus
      )
      prismaService.resource.update.mockResolvedValueOnce(resource)
      const input = {
        name: 'Updated Resource Name'
      }
      expect(
        await resolver.resourceUpdate(ability, 'resourceId', input)
      ).toEqual(resource)
      expect(prismaService.resource.update).toHaveBeenCalledWith({
        where: { id: 'resourceId' },
        data: input,
        include: { resourceLocalizations: true }
      })
    })

    it('updates a resource with empty fields when not passed in', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce(
        resourceWithNexusUserNexus
      )
      await resolver.resourceUpdate(ability, 'resourceId', {
        name: null
      })
      expect(prismaService.resource.update).toHaveBeenCalledWith({
        where: { id: 'resourceId' },
        data: {
          name: undefined
        },
        include: { resourceLocalizations: true }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce({
        ...resource,
        deletedAt: new Date()
      })
      await expect(
        resolver.resourceUpdate(ability, 'resourceId', { name: 'new title' })
      ).rejects.toThrow('user is not allowed to update resource')
    })

    it('throws error if not found', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.resourceUpdate(ability, 'resourceId', { name: 'new title' })
      ).rejects.toThrow('resource not found')
    })
  })

  describe('resourceDelete', () => {
    it('deletes a resource', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce(
        resourceWithNexusUserNexus
      )
      prismaService.resource.update.mockResolvedValueOnce({
        ...resource
      })
      expect(await resolver.resourceDelete(ability, 'resourceId')).toEqual(
        resource
      )
      expect(prismaService.resource.update).toHaveBeenCalledWith({
        where: { id: 'resourceId' },
        data: {
          deletedAt: expect.any(Date)
        },
        include: {
          resourceLocalizations: true
        }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce({
        ...resource,
        deletedAt: new Date()
      })
      await expect(
        resolver.resourceDelete(ability, 'resourceId')
      ).rejects.toThrow('user is not allowed to delete resource')
    })

    it('throws error if not found', async () => {
      prismaService.resource.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.resourceDelete(ability, 'resourceId')
      ).rejects.toThrow('resource not found')
    })
  })
})
