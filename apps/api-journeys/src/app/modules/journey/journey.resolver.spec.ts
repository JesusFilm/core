import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { getPowerBiEmbed } from '@core/nest/powerBi/getPowerBiEmbed'
import { Journey } from '.prisma/api-journeys-client'
import {
  IdType,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole,
  JourneysReportType,
  Role,
  ImageBlock
} from '../../__generated__/graphql'
import { BlockResolver } from '../block/block.resolver'
import { BlockService } from '../block/block.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserRoleService } from '../userRole/userRole.service'
import { UserRoleResolver } from '../userRole/userRole.resolver'
import { PrismaService } from '../../lib/prisma.service'
import {
  ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED,
  JourneyResolver
} from './journey.resolver'
import { JourneyService } from './journey.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('@core/nest/powerBi/getPowerBiEmbed', () => ({
  __esModule: true,
  getPowerBiEmbed: jest.fn()
}))

const mockGetPowerBiEmbed = getPowerBiEmbed as jest.MockedFunction<
  typeof getPowerBiEmbed
>

describe('JourneyResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: JourneyResolver,
    service: JourneyService,
    bService: BlockService,
    ujService: UserJourneyService,
    urService: UserRoleService,
    prisma: PrismaService

  const publishedAt = new Date('2021-11-19T12:34:56.647Z')
  const createdAt = new Date('2021-11-19T12:34:56.647Z')

  const journey: Journey = {
    id: 'journeyId',
    slug: 'journey-slug',
    title: 'published',
    status: JourneyStatus.published,
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    teamId: 'teamId',
    publishedAt,
    createdAt,
    archivedAt: null,
    trashedAt: null,
    featuredAt: null,
    deletedAt: null,
    seoTitle: null,
    seoDescription: null,
    template: false
  }

  const primaryImageBlock: ImageBlock & { _key: string } = {
    _key: 'primaryImageBlock.id',
    __typename: 'ImageBlock',
    id: 'primaryImageBlock.id',
    journeyId: 'socialJourney.id',
    parentBlockId: 'socialJourney.id',
    parentOrder: 1,
    src: 'image.src',
    width: 100,
    height: 100,
    alt: 'primary-image-block',
    blurhash: 'image.blurhash'
  }

  const socialJourney: Journey & { primaryImageBlockId: string | undefined } = {
    ...journey,
    id: 'socialJourney.id',
    primaryImageBlockId: 'primaryImageBlock.id'
  }

  const template: Journey = {
    ...journey,
    title: 'template',
    id: 'templateJourneyId',
    template: true
  }

  const draftJourney = {
    ...journey,
    id: 'draftJourney',
    publishedAt: null,
    status: JourneyStatus.draft
  }
  const archivedJourney = {
    ...journey,
    id: 'archivedJourney',
    status: JourneyStatus.archived
  }
  const trashedJourney = {
    ...journey,
    id: 'deletedJourney',
    status: JourneyStatus.trashed
  }
  const trashedDraftJourney = {
    ...journey,
    id: 'deletedDraftJourney',
    status: JourneyStatus.trashed,
    publishedAt: null
  }

  const draftTemplate = {
    ...journey,
    id: 'draftTemplate',
    template: true,
    slug: 'draft-template-slug',
    status: JourneyStatus.draft
  }

  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    __typename: 'ImageBlock',
    parentBlockId: 'stepId',
    parentOrder: 0,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const journeyUpdate = {
    title: 'published',
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug',
    seoTitle: 'Social media title',
    seoDescription: 'Social media description'
  }

  const templateUpdate = {
    template: true
  }

  const userJourney = {
    id: 'userJourneyId',
    userId: 'userId',
    journeyId: 'journeyId',
    role: UserJourneyRole.editor
  }

  const userRole = {
    id: 'userRole.id',
    userId: 'user.id',
    roles: [Role.publisher]
  }

  const noUserRole = {
    id: 'noUserRole.id',
    userId: 'noUser.id',
    roles: []
  }

  const invitedUserJourney = {
    id: 'invitedUserJourneyId',
    userId: 'invitedUserId',
    journeyId: 'journeyId',
    role: UserJourneyRole.inviteRequested
  }

  const stepBlock = {
    id: 'stepId',
    journeyId: 'journeyId',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    nextBlockId: null
  }

  const duplicatedStep = {
    ...stepBlock,
    id: 'duplicateStepId',
    journeyId: 'duplicateJourneyId'
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      getBySlug: jest.fn((slug) => {
        if (slug === journey.slug) return journey
        if (slug === draftTemplate.slug) return draftTemplate
        return null
      }),
      getAllPublishedJourneys: jest.fn(() => [journey, journey]),
      getAllByIds: jest.fn((ids) => {
        switch (ids[0]) {
          case archivedJourney.id:
            return [archivedJourney]
          case trashedJourney.id:
            return [trashedJourney]
          case trashedDraftJourney.id:
            return [trashedDraftJourney]
          default:
            return [journey, draftJourney]
        }
      }),
      getAllByRole: jest.fn(() => [journey, journey]),
      getAllByTitle: jest.fn((title) =>
        title === journey.title ? [journey] : []
      ),
      save: jest.fn((input) => input),
      update: jest.fn(() => journey),
      updateAll: jest.fn(() => [journey, draftJourney])
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      forJourney: jest.fn(() => [block]),
      get: jest.fn((id) => {
        switch (id) {
          case block.id:
            return block
          case primaryImageBlock.id:
            return primaryImageBlock
        }
      }),
      getBlocksByType: jest.fn(() => [stepBlock]),
      getDuplicateChildren: jest.fn(() => [duplicatedStep]),
      saveAll: jest.fn(() => [duplicatedStep])
    })
  }

  const member = {
    id: 'existingId',
    userId: 'userId',
    teamId: 'jfp-team'
  }

  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      forJourney: jest.fn(() => [userJourney, userJourney]),
      forJourneyUser: jest.fn((journeyId, userId) => {
        if (userId === invitedUserJourney.userId) return invitedUserJourney
        if (userId === userJourney.userId) return userJourney
        return null
      })
    })
  }

  const userRoleService = {
    provide: UserRoleService,
    useFactory: () => ({
      save: jest.fn((userId) => userId),
      getUserRoleById: jest.fn((userId) => {
        if (userId === userRole.userId) return userRole
        if (userId === noUserRole.userId) return noUserRole
      })
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyResolver,
        journeyService,
        blockService,
        BlockResolver,
        userJourneyService,
        UserRoleResolver,
        userRoleService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<JourneyResolver>(JourneyResolver)
    service = module.get<JourneyService>(JourneyService)
    ujService = module.get<UserJourneyService>(UserJourneyService)
    bService = module.get<BlockService>(BlockService)
    urService = module.get<UserRoleService>(UserRoleService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('adminJourneysEmbed', () => {
    it('should throw an error', async () => {
      jest.resetModules()
      const OLD_ENV = process.env
      process.env = {
        ...OLD_ENV,
        POWER_BI_JOURNEYS_MULTIPLE_FULL_REPORT_ID: undefined
      }

      await expect(
        resolver.adminJourneysReport('test id', JourneysReportType.multipleFull)
      ).rejects.toThrow('server environment variables missing')

      process.env = OLD_ENV
    })

    describe('with environment configuration', () => {
      const OLD_ENV = process.env

      beforeEach(() => {
        jest.resetModules() // Most important - it clears the cache
        process.env = { ...OLD_ENV } // Make a copy
        process.env.POWER_BI_CLIENT_ID = 'POWER_BI_CLIENT_ID'
        process.env.POWER_BI_CLIENT_SECRET = 'POWER_BI_CLIENT_SECRET'
        process.env.POWER_BI_TENANT_ID = 'POWER_BI_TENANT_ID'
        process.env.POWER_BI_WORKSPACE_ID = 'POWER_BI_WORKSPACE_ID'
        process.env.POWER_BI_JOURNEYS_MULTIPLE_FULL_REPORT_ID =
          'POWER_BI_JOURNEYS_MULTIPLE_FULL_REPORT_ID'
        process.env.POWER_BI_JOURNEYS_MULTIPLE_SUMMARY_REPORT_ID =
          'POWER_BI_JOURNEYS_MULTIPLE_SUMMARY_REPORT_ID'
        process.env.POWER_BI_JOURNEYS_SINGLE_FULL_REPORT_ID =
          'POWER_BI_JOURNEYS_SINGLE_FULL_REPORT_ID'
        process.env.POWER_BI_JOURNEYS_SINGLE_SUMMARY_REPORT_ID =
          'POWER_BI_JOURNEYS_SINGLE_SUMMARY_REPORT_ID'
      })

      afterAll(() => {
        process.env = OLD_ENV // Restore old environment
      })

      it('should get power bi embed for multiple full', async () => {
        mockGetPowerBiEmbed.mockResolvedValue({
          reportId: 'reportId',
          reportName: 'reportName',
          embedUrl: 'embedUrl',
          accessToken: 'accessToken',
          expiration: '2hrs'
        })
        await expect(
          resolver.adminJourneysReport(
            'userId',
            JourneysReportType.multipleFull
          )
        ).resolves.toEqual({
          reportId: 'reportId',
          reportName: 'reportName',
          embedUrl: 'embedUrl',
          accessToken: 'accessToken',
          expiration: '2hrs'
        })
        expect(mockGetPowerBiEmbed).toHaveBeenCalledWith(
          {
            clientId: 'POWER_BI_CLIENT_ID',
            clientSecret: 'POWER_BI_CLIENT_SECRET',
            tenantId: 'POWER_BI_TENANT_ID',
            workspaceId: 'POWER_BI_WORKSPACE_ID'
          },
          'POWER_BI_JOURNEYS_MULTIPLE_FULL_REPORT_ID',
          'userId'
        )
      })

      it('should get power bi embed for multiple summary', async () => {
        mockGetPowerBiEmbed.mockResolvedValue({
          reportId: 'reportId',
          reportName: 'reportName',
          embedUrl: 'embedUrl',
          accessToken: 'accessToken',
          expiration: '2hrs'
        })
        await expect(
          resolver.adminJourneysReport(
            'userId',
            JourneysReportType.multipleSummary
          )
        ).resolves.toEqual({
          reportId: 'reportId',
          reportName: 'reportName',
          embedUrl: 'embedUrl',
          accessToken: 'accessToken',
          expiration: '2hrs'
        })
        expect(mockGetPowerBiEmbed).toHaveBeenCalledWith(
          {
            clientId: 'POWER_BI_CLIENT_ID',
            clientSecret: 'POWER_BI_CLIENT_SECRET',
            tenantId: 'POWER_BI_TENANT_ID',
            workspaceId: 'POWER_BI_WORKSPACE_ID'
          },
          'POWER_BI_JOURNEYS_MULTIPLE_SUMMARY_REPORT_ID',
          'userId'
        )
      })

      it('should get power bi embed for single full', async () => {
        mockGetPowerBiEmbed.mockResolvedValue({
          reportId: 'reportId',
          reportName: 'reportName',
          embedUrl: 'embedUrl',
          accessToken: 'accessToken',
          expiration: '2hrs'
        })
        await expect(
          resolver.adminJourneysReport('userId', JourneysReportType.singleFull)
        ).resolves.toEqual({
          reportId: 'reportId',
          reportName: 'reportName',
          embedUrl: 'embedUrl',
          accessToken: 'accessToken',
          expiration: '2hrs'
        })
        expect(mockGetPowerBiEmbed).toHaveBeenCalledWith(
          {
            clientId: 'POWER_BI_CLIENT_ID',
            clientSecret: 'POWER_BI_CLIENT_SECRET',
            tenantId: 'POWER_BI_TENANT_ID',
            workspaceId: 'POWER_BI_WORKSPACE_ID'
          },
          'POWER_BI_JOURNEYS_SINGLE_FULL_REPORT_ID',
          'userId'
        )
      })

      it('should get power bi embed for single summary', async () => {
        mockGetPowerBiEmbed.mockResolvedValue({
          reportId: 'reportId',
          reportName: 'reportName',
          embedUrl: 'embedUrl',
          accessToken: 'accessToken',
          expiration: '2hrs'
        })
        await expect(
          resolver.adminJourneysReport(
            'userId',
            JourneysReportType.singleSummary
          )
        ).resolves.toEqual({
          reportId: 'reportId',
          reportName: 'reportName',
          embedUrl: 'embedUrl',
          accessToken: 'accessToken',
          expiration: '2hrs'
        })
        expect(mockGetPowerBiEmbed).toHaveBeenCalledWith(
          {
            clientId: 'POWER_BI_CLIENT_ID',
            clientSecret: 'POWER_BI_CLIENT_SECRET',
            tenantId: 'POWER_BI_TENANT_ID',
            workspaceId: 'POWER_BI_WORKSPACE_ID'
          },
          'POWER_BI_JOURNEYS_SINGLE_SUMMARY_REPORT_ID',
          'userId'
        )
      })
    })
  })

  describe('adminJourneys', () => {
    it('should get published journeys', async () => {
      expect(
        await resolver.adminJourneys(
          'user.id',
          [JourneyStatus.draft, JourneyStatus.published],
          undefined
        )
      ).toEqual([journey, journey])
      expect(urService.getUserRoleById).toHaveBeenCalledWith('user.id')
      expect(service.getAllByRole).toHaveBeenCalledWith(
        userRole,
        [JourneyStatus.draft, JourneyStatus.published],
        undefined
      )
    })
  })

  describe('journeys', () => {
    it('should get published journeys', async () => {
      expect(await resolver.journeys()).toEqual([journey, journey])
      expect(service.getAllPublishedJourneys).toHaveBeenCalledWith(undefined)
    })

    it('should get published and featured journeys', async () => {
      expect(await resolver.journeys({ featured: true })).toEqual([
        journey,
        journey
      ])
      expect(service.getAllPublishedJourneys).toHaveBeenCalledWith({
        featured: true
      })
    })
  })

  describe('adminJourney', () => {
    it('returns Journey by slug', async () => {
      expect(
        await resolver.adminJourney('userId', 'journey-slug', IdType.slug)
      ).toEqual(journey)
      expect(service.getBySlug).toHaveBeenCalledWith('journey-slug')
      expect(ujService.forJourneyUser).toHaveBeenCalledWith(
        userJourney.journeyId,
        userJourney.userId
      )
    })

    it('returns Journey by id', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(journey)
      expect(
        await resolver.adminJourney('userId', 'journeyId', IdType.databaseId)
      ).toEqual(journey)
      expect(prisma.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' }
      })
      expect(ujService.forJourneyUser).toHaveBeenCalledWith(
        userJourney.journeyId,
        userJourney.userId
      )
    })

    it('returns null if no journey found', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(null)
      expect(
        await resolver.adminJourney('userId', '404', IdType.databaseId)
      ).toEqual(null)
      expect(prisma.journey.findUnique).toHaveBeenCalledWith({
        where: { id: '404' }
      })
    })

    it('throws error if user is unknown', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(journey)
      await expect(
        async () =>
          await resolver.adminJourney(
            'unknownUserId',
            'journeyId',
            IdType.databaseId
          )
      ).rejects.toThrow(
        'User has not received an invitation to edit this journey.'
      )
      expect(prisma.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' }
      })
    })

    it('throws error if user is invited', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(journey)
      await expect(
        async () =>
          await resolver.adminJourney(
            'invitedUserId',
            'journeyId',
            IdType.databaseId
          )
      ).rejects.toThrow('User invitation pending.')
      expect(prisma.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' }
      })
    })

    it('return template by slug', async () => {
      expect(
        await resolver.adminJourney(
          'user.id',
          'draft-template-slug',
          IdType.slug
        )
      ).toEqual(draftTemplate)
      expect(service.getBySlug).toHaveBeenCalledWith('draft-template-slug')
      expect(urService.getUserRoleById).toHaveBeenCalledWith(userRole.userId)
    })

    it('returns template by id', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(draftTemplate)
      expect(
        await resolver.adminJourney(
          'user.id',
          'draftTemplate',
          IdType.databaseId
        )
      ).toEqual(draftTemplate)
      expect(prisma.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'draftTemplate' }
      })
      expect(urService.getUserRoleById).toHaveBeenCalledWith(userRole.userId)
    })

    it('throws error if user is not a publisher', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(draftTemplate)
      await expect(
        async () =>
          await resolver.adminJourney(
            'noUser.id',
            'draftTemplate',
            IdType.databaseId
          )
      ).rejects.toThrow('You do not have access to unpublished templates')
    })
  })

  describe('journey', () => {
    it('returns Journey by slug', async () => {
      expect(await resolver.journey('journey-slug', IdType.slug)).toEqual(
        journey
      )
      expect(service.getBySlug).toHaveBeenCalledWith('journey-slug')
    })

    it('returns Journey by id', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(journey)
      expect(await resolver.journey('journeyId', IdType.databaseId)).toEqual(
        journey
      )
      expect(prisma.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' }
      })
    })

    it('returns null if no journey found', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(null)
      expect(await resolver.journey('404', IdType.databaseId)).toEqual(null)
      expect(prisma.journey.findUnique).toHaveBeenCalledWith({
        where: { id: '404' }
      })
    })
  })

  describe('blocks', () => {
    it('returns blocks', async () => {
      expect(await resolver.blocks(journey)).toEqual([block])
    })
  })

  // need working example to diagnose
  describe('primaryImageBlock', () => {
    it('returns primaryImageBlock', async () => {
      expect(
        await resolver.primaryImageBlock({
          ...journey,
          primaryImageBlockId: 'blockId'
        })
      ).toEqual(block)
    })

    it('should return null', async () => {
      expect(await resolver.primaryImageBlock(journey)).toEqual(null)
    })

    it('should return null if primaryImageBlock journeyId is not current journey id ', async () => {
      const journey2 = {
        ...journey,
        id: 'journeyId2'
      }
      expect(
        await resolver.primaryImageBlock({
          ...journey2,
          primaryImageBlockId: 'blockId'
        })
      ).toEqual(null)
    })
  })

  describe('journeyCreate', () => {
    it('creates a Journey', async () => {
      prisma.member.findUnique = jest.fn().mockResolvedValueOnce(member)
      prisma.journey.create = jest
        .fn()
        .mockImplementationOnce((result) => result.data)
      mockUuidv4.mockReturnValueOnce('journeyId')
      expect(
        await resolver.journeyCreate(
          { title: 'Untitled Journey', languageId: '529' },
          'userId'
        )
      ).toEqual({
        id: 'journeyId',
        createdAt: new Date(),
        languageId: '529',
        status: JourneyStatus.draft,
        slug: 'untitled-journey',
        title: 'Untitled Journey',
        teamId: 'jfp-team'
      })
    })

    it('creates a UserJourney', async () => {
      prisma.member.findUnique = jest.fn().mockResolvedValueOnce(member)
      prisma.journey.create = jest.fn().mockResolvedValueOnce(journey)
      mockUuidv4.mockReturnValueOnce('journeyId')
      await resolver.journeyCreate(
        { title: 'Untitled Journey', languageId: '529' },
        'userId'
      )
      expect(ujService.save).toHaveBeenCalledWith({
        userId: 'userId',
        journeyId: 'journeyId',
        role: UserJourneyRole.owner,
        openedAt: new Date()
      })
    })

    it('creates a Member', async () => {
      prisma.member.findUnique = jest.fn().mockResolvedValueOnce(null)
      prisma.member.create = jest.fn()
      prisma.journey.create = jest.fn().mockResolvedValueOnce(journey)
      mockUuidv4.mockReturnValueOnce('journeyId')
      await resolver.journeyCreate(
        { title: 'Untitled Journey', languageId: '529' },
        'userId'
      )
      expect(prisma.member.create).toHaveBeenCalledWith({
        data: {
          id: 'userId:jfp-team',
          userId: 'userId',
          teamId: 'jfp-team'
        }
      })
    })

    it('doesnt create an existing Member', async () => {
      mockUuidv4.mockReturnValueOnce('journeyId')
      prisma.member.findUnique = jest.fn().mockResolvedValueOnce(member)
      prisma.member.create = jest.fn()
      prisma.journey.create = jest.fn().mockResolvedValueOnce(journey)
      await resolver.journeyCreate(
        { title: 'Untitled Journey', languageId: '529' },
        'userId'
      )
      expect(prisma.member.create).not.toHaveBeenCalled()
    })

    it('adds uuid if slug already taken', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      prisma.member.findUnique = jest.fn().mockResolvedValueOnce(member)
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(journey)
      prisma.journey.create = jest
        .fn()
        .mockRejectedValueOnce({
          code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED
        })
        .mockImplementationOnce((result) => result.data)

      mockUuidv4.mockReturnValueOnce('journeyId')
      expect(
        await resolver.journeyCreate(
          { title: 'Untitled Journey', languageId: '529' },
          'userId'
        )
      ).toEqual({
        id: 'journeyId',
        createdAt: new Date(date),
        languageId: '529',
        status: JourneyStatus.draft,
        slug: 'untitled-journey-journeyId',
        title: 'Untitled Journey',
        teamId: 'jfp-team'
      })
    })

    it('throws error and does not get stuck in retry loop', async () => {
      prisma.journey.create = jest
        .fn()
        .mockRejectedValueOnce(new Error('database error'))
      await expect(
        resolver.journeyCreate(
          { title: 'Untitled Journey', languageId: '529' },
          'userId'
        )
      ).rejects.toThrow('database error')
    })
  })

  describe('getFirstMissingNumber', () => {
    it('returns the first missing number in an unsorted number list', async () => {
      const array = [0, 1, 1, 2, 4, 5, 7, 8, 1, 0]
      const firstMissing = resolver.getFirstMissingNumber(array)
      expect(firstMissing).toEqual(3)
    })

    it('returns the next number in a sorted number list', async () => {
      const array = [0, 1, 1, 2, 3]
      const firstMissing = resolver.getFirstMissingNumber(array)
      expect(firstMissing).toEqual(4)
    })
  })

  describe('getJourneyDuplicateNumbers', () => {
    it('generates the duplicate number array from journeys', async () => {
      const array = [
        journey,
        {
          ...journey,
          title: `${journey.title} copy`
        },
        {
          ...journey,
          title: `${journey.title} copy 2`
        },
        // Unique journeys with same base title - returns 0
        {
          ...journey,
          title: `${journey.title} copy test`
        },
        {
          ...journey,
          title: `${journey.title} 3`
        },
        {
          ...journey,
          title: `${journey.title} copy-2a4bil`
        },
        // User edited journey copy number is recognised
        {
          ...journey,
          title: `${journey.title} copy 1`
        }
      ]
      const duplicateNumbers = resolver.getJourneyDuplicateNumbers(
        array,
        journey.title
      )
      expect(duplicateNumbers).toEqual([0, 1, 2, 0, 0, 0, 1])
      const arrayCopy = [
        {
          ...journey,
          title: `journey copy`
        },
        {
          ...journey,
          title: `journey copy 1`
        },
        {
          ...journey,
          title: `journey copy copy`
        },
        {
          ...journey,
          title: `journey copy copy 2`
        }
      ]
      const duplicateNumbersCopy = resolver.getJourneyDuplicateNumbers(
        arrayCopy,
        'journey copy'
      )
      expect(duplicateNumbersCopy).toEqual([0, 0, 1, 2])
    })
  })

  describe('journeyDuplicate', () => {
    it('duplicates your journey', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      mockUuidv4.mockReturnValueOnce('duplicateJourneyId')
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(journey)
      prisma.journey.create = jest
        .fn()
        .mockImplementation((result) => result.data)
      expect(await resolver.journeyDuplicate('journeyId', 'userId')).toEqual({
        ...journey,
        id: 'duplicateJourneyId',
        createdAt: new Date(date),
        status: JourneyStatus.draft,
        publishedAt: undefined,
        slug: `${journey.title}-copy`,
        title: `${journey.title} copy`,
        template: false,
        primaryImageBlockId: undefined
      })
    })

    it('duplicates a template journey', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      mockUuidv4.mockReturnValueOnce('templateJourneyId')
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(template)
      prisma.journey.create = jest
        .fn()
        .mockImplementation((result) => result.data)
      expect(
        await resolver.journeyDuplicate('templateJourneyId', 'userId')
      ).toEqual({
        ...template,
        title: 'template',
        slug: 'template',
        createdAt: new Date(date),
        status: JourneyStatus.draft,
        publishedAt: undefined,
        template: false,
        primaryImageBlockId: undefined
      })
    })

    it('duplicates a UserJourney', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(journey)
      prisma.journey.create = jest
        .fn()
        .mockImplementation((result) => result.data)
      mockUuidv4.mockReturnValueOnce('duplicateJourneyId')
      await resolver.journeyDuplicate('journeyId', 'userId')
      expect(ujService.save).toHaveBeenCalledWith({
        id: undefined,
        userId: 'userId',
        journeyId: 'duplicateJourneyId',
        role: UserJourneyRole.owner,
        openedAt: new Date()
      })
    })

    it('duplicates blocks in journey', async () => {
      mockUuidv4.mockReturnValueOnce('duplicateJourneyId')
      mockUuidv4.mockReturnValueOnce('duplicateStepId')
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(template)
      prisma.journey.create = jest
        .fn()
        .mockImplementation((result) => result.data)
      const duplicateStepIds = new Map([[stepBlock.id, duplicatedStep.id]])
      await resolver.journeyDuplicate('journeyId', 'userId')
      expect(bService.getDuplicateChildren).toHaveBeenCalledWith(
        [stepBlock],
        'journeyId',
        null,
        duplicateStepIds,
        'duplicateJourneyId',
        duplicateStepIds
      )
      expect(bService.saveAll).toHaveBeenCalledWith([duplicatedStep])
    })

    it('increments copy number on journey if multiple duplicates exist', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      mockUuidv4.mockReturnValueOnce('duplicateJourneyId2')
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(journey)
      prisma.journey.create = jest
        .fn()
        .mockImplementation((result) => result.data)
      const mockGetAllByTitle = service.getAllByTitle as jest.MockedFunction<
        typeof service.getAllByTitle
      >
      mockGetAllByTitle.mockImplementationOnce(
        async () =>
          await Promise.resolve([
            journey,
            { ...journey, title: `${journey.title} copy` },
            { ...journey, title: `${journey.title} copy other` }
          ])
      )
      expect(await resolver.journeyDuplicate('journeyId', 'userId')).toEqual({
        ...journey,
        id: 'duplicateJourneyId2',
        createdAt: new Date(date),
        status: JourneyStatus.draft,
        publishedAt: undefined,
        slug: `${journey.title}-copy-2`,
        title: `${journey.title} copy 2`,
        template: false,
        primaryImageBlockId: undefined
      })
    })

    it('throws error and does not get stuck in retry loop', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(journey)
      prisma.journey.create = jest
        .fn()
        .mockRejectedValueOnce(new Error('database error'))
      await expect(
        resolver.journeyDuplicate('journeyId', 'userId')
      ).rejects.toThrow('database error')
    })

    it('should duplicate the primaryImageBlock and add it to the duplicated journey', async () => {
      mockUuidv4
        .mockReturnValueOnce('duplicateJourneyId')
        .mockReturnValueOnce('duplicateStepId')
        .mockReturnValueOnce('duplicatePrimaryImageBlock.id')
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(socialJourney)
      prisma.journey.create = jest
        .fn()
        .mockResolvedValueOnce((result) => result)
      const duplicateStepIds = new Map([[stepBlock.id, duplicatedStep.id]])
      await resolver.journeyDuplicate('socialJourney.id', 'userId')
      expect(bService.getDuplicateChildren).toHaveBeenCalledWith(
        [stepBlock],
        'socialJourney.id',
        null,
        duplicateStepIds,
        'duplicateJourneyId',
        duplicateStepIds
      )
      expect(bService.saveAll).toHaveBeenCalledWith([
        duplicatedStep,
        {
          ...primaryImageBlock,
          _key: 'duplicatePrimaryImageBlock.id',
          journeyId: 'duplicateJourneyId',
          parentBlockId: 'duplicateJourneyId'
        }
      ])
    })
  })

  describe('journeyUpdate', () => {
    it('updates a Journey', async () => {
      prisma.journey.update = jest.fn().mockResolvedValueOnce(journey)
      await resolver.journeyUpdate('1', journeyUpdate)
      expect(prisma.journey.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: journeyUpdate
      })
    })

    it('throws UserInputErrror', async () => {
      prisma.journey.update = jest
        .fn()
        .mockRejectedValueOnce({ code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED })
      await expect(
        resolver.journeyUpdate('journeyId', { slug: 'untitled-journey' })
      ).rejects.toThrow('Slug is not unique')
    })

    it('throws error gracefully', async () => {
      prisma.journey.update = jest
        .fn()
        .mockRejectedValueOnce(new Error('database error'))
      await expect(
        resolver.journeyUpdate('journeyId', { title: 'Untitled Journey' })
      ).rejects.toThrow('database error')
    })
  })

  describe('journeyPublish', () => {
    it('publishes a Journey', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      prisma.journey.update = jest.fn().mockResolvedValue(journey)
      await resolver.journeyPublish('1')
      expect(prisma.journey.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: JourneyStatus.published,
          publishedAt: new Date(date)
        }
      })
    })
  })

  describe('journeysArchive', () => {
    it('archives an array of Journeys', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      prisma.journey.findUnique = jest
        .fn()
        .mockResolvedValue(journey)
        .mockResolvedValueOnce(draftJourney)
      prisma.journey.updateMany = jest
        .fn()
        .mockResolvedValueOnce([journey, draftJourney])
      await resolver.journeysArchive([journey.id, draftJourney.id])
      expect(prisma.journey.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [journey.id, draftJourney.id] } },
        data: { status: JourneyStatus.archived, archivedAt: new Date(date) }
      })
    })
  })

  describe('journeysTrash', () => {
    it('trashes an array of Journeys', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      prisma.journey.findUnique = jest
        .fn()
        .mockResolvedValue(journey)
        .mockResolvedValueOnce(draftJourney)
      prisma.journey.updateMany = jest
        .fn()
        .mockResolvedValueOnce([journey, draftJourney])
      await resolver.journeysTrash([journey.id, draftJourney.id])
      expect(prisma.journey.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [journey.id, draftJourney.id] } },
        data: { status: JourneyStatus.trashed, trashedAt: new Date(date) }
      })
    })
  })

  describe('journeysDelete', () => {
    it('deletes an array of Journeys', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      prisma.journey.findUnique = jest
        .fn()
        .mockResolvedValue(journey)
        .mockResolvedValueOnce(draftJourney)
      prisma.journey.updateMany = jest
        .fn()
        .mockResolvedValueOnce([journey, draftJourney])
      await resolver.journeysDelete([journey.id, draftJourney.id])
      expect(prisma.journey.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [journey.id, draftJourney.id] } },
        data: { status: JourneyStatus.deleted, deletedAt: new Date(date) }
      })
    })
  })

  describe('journeysRestore', () => {
    it('resores a published Journey', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValue(trashedJourney)
      prisma.journey.update = jest.fn().mockResolvedValue(trashedJourney)
      await resolver.journeysRestore([trashedJourney.id])
      expect(prisma.journey.update).toHaveBeenCalledWith({
        where: { id: trashedJourney.id },
        data: { status: JourneyStatus.published }
      })
    })

    it('restores an draft Journey', async () => {
      prisma.journey.findUnique = jest
        .fn()
        .mockResolvedValue(trashedDraftJourney)
      prisma.journey.update = jest.fn().mockResolvedValue(trashedJourney)
      await resolver.journeysRestore([trashedDraftJourney.id])
      expect(prisma.journey.update).toHaveBeenCalledWith({
        where: { id: trashedDraftJourney.id },
        data: { status: JourneyStatus.draft }
      })
    })
  })

  describe('journeyTemplate', () => {
    it('updates template', async () => {
      prisma.journey.update = jest.fn().mockResolvedValueOnce(journey)
      await resolver.journeyTemplate('1', templateUpdate)
      expect(prisma.journey.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: templateUpdate
      })
    })
  })

  describe('userJourneys', () => {
    it('should get userJourneys', async () => {
      expect(await resolver.userJourneys(journey)).toEqual([
        userJourney,
        userJourney
      ])
      expect(ujService.forJourney).toHaveBeenCalledWith(journey)
    })
  })

  describe('language', () => {
    it('returns object for federation', async () => {
      expect(await resolver.language({ languageId: 'languageId' })).toEqual({
        __typename: 'Language',
        id: 'languageId'
      })
    })
    it('when no languageId returns object for federation with default', async () => {
      expect(await resolver.language({})).toEqual({
        __typename: 'Language',
        id: '529'
      })
    })
  })
})
