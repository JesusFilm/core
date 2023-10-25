import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

import {
  Action,
  Block,
  ChatButton,
  Host,
  Journey,
  Prisma,
  Team,
  ThemeMode,
  ThemeName,
  UserJourney,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { getPowerBiEmbed } from '@core/nest/powerBi/getPowerBiEmbed'

import {
  IdType,
  JourneyStatus,
  JourneysReportType
} from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED } from '../../lib/prismaErrors'
import { BlockResolver } from '../block/block.resolver'
import { BlockService } from '../block/block.service'
import { UserRoleResolver } from '../userRole/userRole.resolver'
import { UserRoleService } from '../userRole/userRole.service'

import { JourneyResolver } from './journey.resolver'

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
  let resolver: JourneyResolver,
    blockService: DeepMockProxy<BlockService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility,
    abilityWithPublisher: AppAbility

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
    publishedAt: new Date('2021-11-19T12:34:56.647Z'),
    createdAt: new Date('2021-11-19T12:34:56.647Z'),
    updatedAt: new Date('2021-11-19T12:34:56.647Z'),
    archivedAt: null,
    trashedAt: null,
    featuredAt: null,
    deletedAt: null,
    seoTitle: null,
    seoDescription: null,
    template: false,
    hostId: null,
    strategySlug: null
  }
  const journeyWithUserTeam = {
    ...journey,
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  }

  const journeyWithTemplate = {
    ...journey,
    template: true
  }

  const block = {
    id: 'blockId',
    typename: 'ImageBlock',
    journeyId: 'journeyId'
  } as unknown as Block
  const accessibleJourneys: Prisma.JourneyWhereInput = { OR: [{}] }

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2020, 3, 1))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyResolver,
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        },
        BlockResolver,
        UserRoleResolver,
        UserRoleService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<JourneyResolver>(JourneyResolver)
    blockService = module.get<BlockService>(
      BlockService
    ) as DeepMockProxy<BlockService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({
      id: 'userId'
    })
    abilityWithPublisher = await new AppCaslFactory().createAbility({
      id: 'userId',
      roles: ['publisher']
    })
  })

  describe('adminJourneysReport', () => {
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
    const journeysSharedWithMe: Prisma.JourneyWhereInput = {
      userJourneys: {
        some: {
          userId: 'userId',
          role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
        }
      },
      team: {
        userTeams: {
          none: {
            userId: 'userId'
          }
        }
      }
    }

    beforeEach(() => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey])
    })

    it('should get journeys that are shared with me', async () => {
      expect(
        await resolver.adminJourneys('userId', accessibleJourneys)
      ).toEqual([journey])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleJourneys, journeysSharedWithMe]
        }
      })
    })

    it('should get filtered journeys', async () => {
      expect(
        await resolver.adminJourneys(
          'userId',
          accessibleJourneys,
          [JourneyStatus.archived],
          false,
          'teamId'
        )
      ).toEqual([journey])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            accessibleJourneys,
            {
              status: { in: [JourneyStatus.archived] },
              template: false,
              teamId: 'teamId'
            }
          ]
        }
      })
    })

    describe('status', () => {
      it('should get journeys that are shared with me with status', async () => {
        expect(
          await resolver.adminJourneys('userId', accessibleJourneys, [
            JourneyStatus.draft
          ])
        ).toEqual([journey])
        expect(prismaService.journey.findMany).toHaveBeenCalledWith({
          where: {
            AND: [
              accessibleJourneys,
              { ...journeysSharedWithMe, status: { in: [JourneyStatus.draft] } }
            ]
          }
        })
      })
    })

    describe('template', () => {
      it('should get template journeys', async () => {
        expect(
          await resolver.adminJourneys(
            'userId',
            accessibleJourneys,
            undefined,
            true
          )
        ).toEqual([journey])
        expect(prismaService.journey.findMany).toHaveBeenCalledWith({
          where: {
            AND: [accessibleJourneys, { template: true }]
          }
        })
      })
    })

    describe('teamId', () => {
      it('should get journeys belonging to team', async () => {
        expect(
          await resolver.adminJourneys(
            'userId',
            accessibleJourneys,
            undefined,
            undefined,
            'teamId'
          )
        ).toEqual([journey])
        expect(prismaService.journey.findMany).toHaveBeenCalledWith({
          where: {
            AND: [accessibleJourneys, { teamId: 'teamId' }]
          }
        })
      })
    })
  })

  describe('adminJourney', () => {
    it('returns journey by slug', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      expect(
        await resolver.adminJourney(ability, 'journey-slug', IdType.slug)
      ).toEqual(journeyWithUserTeam)
      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { slug: 'journey-slug' },
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      })
    })

    it('returns journey by id', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      expect(
        await resolver.adminJourney(ability, 'journeyId', IdType.databaseId)
      ).toEqual(journeyWithUserTeam)
      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.adminJourney(ability, 'journeyId', IdType.databaseId)
      ).rejects.toThrow('journey not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      await expect(
        resolver.adminJourney(ability, 'journeyId', IdType.databaseId)
      ).rejects.toThrow('user is not allowed to view journey')
    })
  })

  describe('journeys', () => {
    it('returns published journeys', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey, journey])
      expect(await resolver.journeys()).toEqual([journey, journey])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: 'published'
        }
      })
    })

    it('returns published journeys where featuredAt', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey, journey])
      expect(await resolver.journeys({ featured: true })).toEqual([
        journey,
        journey
      ])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: 'published',
          featuredAt: { not: null }
        }
      })
    })

    it('returns published journeys where featuredAt is false', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey, journey])
      expect(await resolver.journeys({ featured: false })).toEqual([
        journey,
        journey
      ])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: 'published',
          featuredAt: null
        }
      })
    })

    it('returns published journeys where template', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([
        journeyWithTemplate,
        journeyWithTemplate
      ])
      const fetchedJourneys = await resolver.journeys({ template: true })
      expect(fetchedJourneys).toEqual([
        journeyWithTemplate,
        journeyWithTemplate
      ])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: 'published',
          template: true
        }
      })
      expect(fetchedJourneys[0].template).toBe(true)
      expect(fetchedJourneys[1].template).toBe(true)
    })

    it('returns published journeys where template is false', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey, journey])
      const fetchedJourneys = await resolver.journeys({ template: false })
      expect(fetchedJourneys).toEqual([journey, journey])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: 'published',
          template: false
        }
      })
      expect(fetchedJourneys[0].template).toBe(false)
      expect(fetchedJourneys[1].template).toBe(false)
    })

    it('returns a list of journeys', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey, journey])
      expect(
        await resolver.journeys({ ids: [journey.id, journey.id] })
      ).toEqual([journey, journey])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['journeyId', 'journeyId'] }, status: 'published' }
      })
    })

    it('returns a list of journeys filtered by tags', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([])
      await resolver.journeys({ tagIds: ['tagId1', 'tagId2'] })

      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { journeyTags: { some: { tagId: 'tagId1' } } },
            { journeyTags: { some: { tagId: 'tagId2' } } }
          ],
          status: 'published'
        },
        include: { journeyTags: true }
      })
    })

    it('returns a list of journeys filtered by languageId', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([])
      await resolver.journeys({ languageIds: ['529'] })

      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          languageId: { in: ['529'] },
          status: 'published'
        }
      })
    })

    it('returns limited number of published journeys', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey, journey])
      expect(await resolver.journeys({ limit: 2 })).toEqual([journey, journey])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: 'published'
        },
        take: 2
      })
    })

    it('returns published journeys ordered by recent', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey, journey])
      expect(await resolver.journeys({ orderByRecent: true })).toEqual([
        journey,
        journey
      ])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: 'published'
        },
        orderBy: { publishedAt: 'desc' }
      })
    })
  })

  describe('journey', () => {
    it('returns journey by slug', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      expect(await resolver.journey('journey-slug', IdType.slug)).toEqual(
        journey
      )
      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { slug: 'journey-slug' }
      })
    })

    it('returns journey by id', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      expect(await resolver.journey('journeyId', IdType.databaseId)).toEqual(
        journey
      )
      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' }
      })
    })

    it('throws error if not found', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.journey('unknownId', IdType.databaseId)
      ).rejects.toThrow('journey not found')
    })
  })

  describe('journeyCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a journey', async () => {
      prismaService.journey.create.mockResolvedValueOnce(journey)
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      mockUuidv4.mockReturnValueOnce('journeyId')
      expect(
        await resolver.journeyCreate(
          ability,
          { title: 'Untitled Journey', languageId: '529' },
          'userId',
          'teamId'
        )
      ).toEqual(journeyWithUserTeam)
      expect(prismaService.journey.create).toHaveBeenCalledWith({
        data: {
          id: 'journeyId',
          languageId: '529',
          slug: 'untitled-journey',
          status: JourneyStatus.published,
          publishedAt: new Date(),
          team: {
            connect: {
              id: 'teamId'
            }
          },
          title: 'Untitled Journey',
          userJourneys: {
            create: {
              role: 'owner',
              userId: 'userId'
            }
          }
        }
      })
    })

    it('adds uuid if slug already taken', async () => {
      prismaService.journey.create
        .mockRejectedValueOnce({
          code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED
        })
        .mockResolvedValueOnce(journey)
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      expect(
        await resolver.journeyCreate(
          ability,
          {
            id: 'myJourneyId',
            title: 'Untitled Journey',
            slug: 'special-journey',
            languageId: '529'
          },
          'userId',
          'teamId'
        )
      ).toEqual(journeyWithUserTeam)
      expect(prismaService.journey.create).toHaveBeenCalledWith({
        data: {
          id: 'myJourneyId',
          languageId: '529',
          slug: 'special-journey-myJourneyId',
          status: JourneyStatus.published,
          publishedAt: new Date(),
          team: {
            connect: {
              id: 'teamId'
            }
          },
          title: 'Untitled Journey',
          userJourneys: {
            create: {
              role: 'owner',
              userId: 'userId'
            }
          }
        }
      })
    })

    it('throws error and does not get stuck in retry loop', async () => {
      prismaService.journey.create.mockRejectedValueOnce(
        new Error('database error')
      )
      await expect(
        resolver.journeyCreate(
          ability,
          { title: 'Untitled Journey', languageId: '529' },
          'userId',
          'teamId'
        )
      ).rejects.toThrow('database error')
    })

    it('throws error if not found', async () => {
      prismaService.journey.create.mockResolvedValueOnce(journey)
      prismaService.journey.findUnique.mockResolvedValue(null)
      await expect(
        resolver.journeyCreate(
          ability,
          { title: 'Untitled Journey', languageId: '529' },
          'userId',
          'teamId'
        )
      ).rejects.toThrow('journey not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.journey.create.mockResolvedValueOnce(journey)
      prismaService.journey.findUnique.mockResolvedValue(journey)
      await expect(
        resolver.journeyCreate(
          ability,
          { title: 'Untitled Journey', languageId: '529' },
          'userId',
          'teamId'
        )
      ).rejects.toThrow('user is not allowed to create journey')
    })
  })

  describe('getFirstMissingNumber', () => {
    it('returns the first missing number in an unsorted number list', async () => {
      const array = [0, 1, 1, 2, 4, 5, 7, 8, 1, 0]
      const firstMissing = resolver.getFirstMissingNumber(array)
      expect(firstMissing).toBe(3)
    })

    it('returns the next number in a sorted number list', async () => {
      const array = [0, 1, 1, 2, 3]
      const firstMissing = resolver.getFirstMissingNumber(array)
      expect(firstMissing).toBe(4)
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
    const step: Block & { action: Action | null } = {
      ...block,
      id: 'stepId',
      journeyId: 'journeyId',
      typename: 'StepBlock',
      parentOrder: 0,
      action: null
    }
    const duplicatedStep = {
      ...step,
      journeyId: 'duplicateJourneyId',
      id: 'duplicateStepId'
    }

    const button: Block & { action: Action } = {
      ...block,
      id: 'buttonId',
      journeyId: 'journeyId',
      typename: 'ButtonBlock',
      action: {
        gtmEventName: null,
        journeyId: null,
        url: null,
        target: null,
        email: null,
        updatedAt: new Date(),
        parentBlockId: 'stepId',
        blockId: 'nextStepId'
      }
    }
    const duplicatedButton = {
      ...button,
      id: 'duplicateButtonId',
      journeyId: 'duplicateJourneyId',
      action: {
        ...button.action,
        blockId: 'duplicateNextStepId'
      }
    }
    const nextStep: Block & { action: Action | null } = {
      ...block,
      id: 'nextStepId',
      journeyId: 'journeyId',
      typename: 'StepBlock',
      parentOrder: 1,
      action: null
    }
    const duplicatedNextStep = {
      ...nextStep,
      id: 'duplicateNextStepId',
      journeyId: 'duplicateJourneyId'
    }
    const primaryImage = {
      ...block,
      typename: 'ImageBlock',
      id: 'primaryImageBlockId',
      parentOrder: 2,
      src: 'image.src',
      width: 100,
      height: 100,
      alt: 'primary-image-block',
      blurhash: 'image.blurhash'
    }
    const duplicatedPrimaryImage = {
      ...primaryImage,
      id: 'duplicatePrimaryImageId',
      journeyId: 'duplicateJourneyId'
    }

    beforeEach(() => {
      mockUuidv4.mockReturnValueOnce('duplicateJourneyId')
      prismaService.journey.findUnique
        // lookup existing journey to duplicate and authorize
        .mockResolvedValueOnce(journeyWithUserTeam)
        // lookup duplicate journey once created and authorize
        .mockResolvedValueOnce(journeyWithUserTeam)
      // find existing duplicate journeys
      prismaService.journey.findMany.mockResolvedValueOnce([journey])
      // find steps connected with existing journey
      prismaService.block.findMany.mockResolvedValueOnce([block])
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
      blockService.getDuplicateChildren.mockResolvedValue([
        duplicatedStep,
        duplicatedButton,
        duplicatedNextStep
      ])
    })

    it('duplicates your journey', async () => {
      await resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      expect(prismaService.journey.create).toHaveBeenCalledWith({
        data: {
          ...omit(journey, [
            'parentBlockId',
            'nextBlockId',
            'hostId',
            'primaryImageBlockId',
            'publishedAt',
            'teamId',
            'createdAt',
            'strategySlug'
          ]),
          id: 'duplicateJourneyId',
          status: JourneyStatus.published,
          publishedAt: new Date(),
          slug: `${journey.title}-copy`,
          title: `${journey.title} copy`,
          template: false,
          featuredAt: null,
          team: {
            connect: { id: 'teamId' }
          },
          userJourneys: {
            create: {
              userId: 'userId',
              role: UserJourneyRole.owner
            }
          },
          journeyTags: undefined
        }
      })
    })

    it('duplicates a template journey', async () => {
      const journeyTags = [
        {
          id: 'id',
          tagId: 'tagId',
          journeyId: 'journeyId'
        }
      ]
      const journeyWithTags = { ...journeyWithUserTeam, journeyTags }
      prismaService.journey.findUnique
        .mockReset()
        // lookup journey to duplicate and authorize
        .mockResolvedValueOnce({
          ...journeyWithTags,
          template: true
        } as unknown as Prisma.Prisma__JourneyClient<Journey>)
        // lookup duplicate journey once created and authorize
        .mockResolvedValueOnce(journeyWithTags)
      prismaService.journey.findMany
        .mockReset()
        // lookup existing duplicate active journeys
        .mockResolvedValueOnce([])

      // Initial duplicate creates slug with journey title only
      prismaService.journey.create.mockRejectedValueOnce({
        code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED
      })

      await resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')

      const data = {
        ...omit(journey, [
          'parentBlockId',
          'nextBlockId',
          'hostId',
          'primaryImageBlockId',
          'publishedAt',
          'teamId',
          'createdAt',
          'strategySlug'
        ]),
        id: 'duplicateJourneyId',
        status: JourneyStatus.published,
        publishedAt: new Date(),
        slug: journey.title,
        title: journey.title,
        featuredAt: null,
        template: false,
        team: {
          connect: { id: 'teamId' }
        },
        userJourneys: {
          create: {
            userId: 'userId',
            role: UserJourneyRole.owner
          }
        },
        journeyTags: {
          create: [
            {
              journey: { connect: { id: 'duplicateJourneyId' } },
              journeyId: 'duplicateJourneyId',
              tagId: 'tagId'
            }
          ]
        }
      }

      expect(prismaService.journey.create).toHaveBeenNthCalledWith(1, { data })
      expect(prismaService.journey.create).toHaveBeenLastCalledWith({
        data: { ...data, slug: `${journey.title}-duplicateJourneyId` }
      })
    })

    it('duplicates blocks in journey', async () => {
      mockUuidv4.mockReturnValueOnce(duplicatedStep.id)
      mockUuidv4.mockReturnValueOnce(duplicatedNextStep.id)
      const duplicateStepIds = new Map([
        [step.id, duplicatedStep.id],
        [nextStep.id, duplicatedNextStep.id]
      ])
      prismaService.block.findMany
        .mockReset()
        .mockResolvedValueOnce([step, nextStep])
      await resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      expect(blockService.getDuplicateChildren).toHaveBeenCalledWith(
        [step, nextStep],
        'journeyId',
        null,
        duplicateStepIds,
        'duplicateJourneyId',
        duplicateStepIds
      )
      expect(blockService.saveAll).toHaveBeenCalledWith([
        {
          ...omit(duplicatedStep, [
            'journeyId',
            'parentBlockId',
            'posterBlockId',
            'coverBlockId',
            'nextBlockId',
            'action'
          ]),
          journey: { connect: { id: 'duplicateJourneyId' } }
        },
        {
          ...omit(duplicatedButton, [
            'journeyId',
            'parentBlockId',
            'posterBlockId',
            'coverBlockId',
            'nextBlockId',
            'action'
          ]),
          journey: { connect: { id: 'duplicateJourneyId' } }
        },
        {
          ...omit(duplicatedNextStep, [
            'journeyId',
            'parentBlockId',
            'posterBlockId',
            'coverBlockId',
            'nextBlockId',
            'action'
          ]),
          journey: { connect: { id: 'duplicateJourneyId' } }
        }
      ])
    })

    it('increments copy number on journey if multiple duplicates exist', async () => {
      prismaService.journey.findMany
        .mockReset()
        .mockResolvedValueOnce([
          journey,
          { ...journey, title: `${journey.title} copy` },
          { ...journey, title: `${journey.title} copy other` }
        ])
      await resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      expect(prismaService.journey.create).toHaveBeenCalledWith({
        data: {
          ...omit(journey, [
            'parentBlockId',
            'nextBlockId',
            'hostId',
            'primaryImageBlockId',
            'publishedAt',
            'teamId',
            'createdAt',
            'strategySlug'
          ]),
          id: 'duplicateJourneyId',
          status: JourneyStatus.published,
          publishedAt: new Date(),
          slug: `${journey.title}-copy-2`,
          title: `${journey.title} copy 2`,
          featuredAt: null,
          template: false,
          team: {
            connect: { id: 'teamId' }
          },
          userJourneys: {
            create: {
              userId: 'userId',
              role: UserJourneyRole.owner
            }
          }
        }
      })
    })

    it('should duplicate the primaryImageBlock and add it to the duplicated journey', async () => {
      prismaService.journey.findUnique
        .mockReset()
        // lookup existing journey to duplicate and authorize
        .mockResolvedValueOnce({
          ...journeyWithUserTeam,
          primaryImageBlockId: primaryImage.id
        })
        // lookup duplicate journey once created and authorize
        .mockResolvedValueOnce(journeyWithUserTeam)
      prismaService.block.findUnique.mockResolvedValueOnce(primaryImage)
      mockUuidv4.mockReturnValueOnce(duplicatedStep.id)
      mockUuidv4.mockReturnValueOnce(duplicatedNextStep.id)
      mockUuidv4.mockReturnValueOnce(duplicatedPrimaryImage.id)
      const duplicateStepIds = new Map([
        [step.id, duplicatedStep.id],
        [nextStep.id, duplicatedNextStep.id]
      ])
      prismaService.block.findMany
        .mockReset()
        .mockResolvedValueOnce([step, nextStep])
      await resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      expect(blockService.getDuplicateChildren).toHaveBeenCalledWith(
        [step, nextStep],
        'journeyId',
        null,
        duplicateStepIds,
        'duplicateJourneyId',
        duplicateStepIds
      )
      expect(blockService.saveAll).toHaveBeenCalledWith([
        {
          ...omit(duplicatedStep, [
            'journeyId',
            'parentBlockId',
            'posterBlockId',
            'coverBlockId',
            'nextBlockId',
            'action'
          ]),
          journey: { connect: { id: 'duplicateJourneyId' } }
        },
        {
          ...omit(duplicatedButton, [
            'journeyId',
            'parentBlockId',
            'posterBlockId',
            'coverBlockId',
            'nextBlockId',
            'action'
          ]),
          journey: { connect: { id: 'duplicateJourneyId' } }
        },
        {
          ...omit(duplicatedNextStep, [
            'journeyId',
            'parentBlockId',
            'posterBlockId',
            'coverBlockId',
            'nextBlockId',
            'action'
          ]),
          journey: { connect: { id: 'duplicateJourneyId' } }
        },
        {
          ...omit(duplicatedPrimaryImage, [
            'journeyId',
            'parentBlockId',
            'posterBlockId',
            'coverBlockId',
            'nextBlockId',
            'action'
          ]),
          journey: { connect: { id: 'duplicateJourneyId' } }
        }
      ])
    })

    it('should duplicate actions', async () => {
      mockUuidv4.mockReturnValueOnce(duplicatedStep.id)
      mockUuidv4.mockReturnValueOnce(duplicatedNextStep.id)
      mockUuidv4.mockReturnValueOnce(duplicatedButton.id)
      const duplicateStepIds = new Map([
        [step.id, duplicatedStep.id],
        [nextStep.id, duplicatedNextStep.id]
      ])
      prismaService.block.findMany
        .mockReset()
        .mockResolvedValueOnce([step, nextStep])
      await resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      expect(blockService.getDuplicateChildren).toHaveBeenCalledWith(
        [step, nextStep],
        'journeyId',
        null,
        duplicateStepIds,
        'duplicateJourneyId',
        duplicateStepIds
      )
      expect(prismaService.action.create).toHaveBeenCalledWith({
        data: {
          ...duplicatedButton.action,
          blockId: duplicatedNextStep.id,
          parentBlockId: duplicatedButton.id
        }
      })
    })

    it('throws error and does not get stuck in retry loop', async () => {
      prismaService.journey.create.mockRejectedValueOnce(
        new Error('database error')
      )
      await expect(
        resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      ).rejects.toThrow('database error')
    })

    it('throws error if existing journey not authorized', async () => {
      prismaService.journey.findUnique
        .mockReset()
        .mockResolvedValueOnce(journey)
      await expect(
        resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      ).rejects.toThrow('user is not allowed to duplicate journey')
    })

    it('throws error if existing journey not found', async () => {
      prismaService.journey.findUnique.mockReset().mockResolvedValueOnce(null)
      await expect(
        resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      ).rejects.toThrow('journey not found')
    })

    it('throws error if duplicate journey not authorized', async () => {
      prismaService.journey.findUnique
        .mockReset()
        .mockResolvedValueOnce(journeyWithUserTeam)
        .mockResolvedValueOnce(journey)
      await expect(
        resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      ).rejects.toThrow('user is not allowed to duplicate journey')
    })

    it('throws error if duplicate journey not found', async () => {
      prismaService.journey.findUnique
        .mockReset()
        .mockResolvedValueOnce(journeyWithUserTeam)
        .mockResolvedValueOnce(null)
      await expect(
        resolver.journeyDuplicate(ability, 'journeyId', 'userId', 'teamId')
      ).rejects.toThrow('journey not found')
    })
  })

  describe('journeyUpdate', () => {
    const host: Host = {
      id: 'hostId',
      teamId: 'teamId',
      title: 'Bob & Sarah Jones',
      location: 'Dunedin, New Zealand',
      src1: 'avatar1-id',
      src2: 'avatar2-id',
      updatedAt: new Date()
    }

    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('updates a journey', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce(host)
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      await resolver.journeyUpdate(ability, 'journeyId', {
        title: 'new title',
        languageId: '529',
        slug: 'new-slug',
        hostId: 'hostId',
        tagIds: ['tagId1'],
        strategySlug: 'https://docs.google.com/presentation/slidesId'
      })

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: {
          title: 'new title',
          languageId: '529',
          slug: 'new-slug',
          hostId: 'hostId',
          strategySlug: 'https://docs.google.com/presentation/slidesId',
          journeyTags: { create: [{ tagId: 'tagId1' }] }
        }
      })
    })

    it('updates a journey with empty fields when not passed in', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      await resolver.journeyUpdate(ability, 'journeyId', {
        title: null,
        languageId: null,
        slug: null,
        tagIds: null
      })
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: {
          title: undefined,
          languageId: undefined,
          slug: undefined,
          journeyTags: undefined
        }
      })
    })

    it('throws error if host not found', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce(null)
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      await expect(
        resolver.journeyUpdate(ability, 'journeyId', { hostId: 'hostId' })
      ).rejects.toThrow('host not found')
    })

    it('throws error if host does not belong to same team as journey', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce({
        ...host,
        teamId: 'otherTeamId'
      })
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      await expect(
        resolver.journeyUpdate(ability, 'journeyId', { hostId: 'hostId' })
      ).rejects.toThrow(
        'the team id of host does not not match team id of journey'
      )
    })

    it('throws error if slug is not unique', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      prismaService.journey.update.mockRejectedValueOnce({
        code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED
      })
      await expect(
        resolver.journeyUpdate(ability, 'journeyId', {
          slug: 'untitled-journey'
        })
      ).rejects.toThrow('slug is not unique')
    })

    it('throws error if update fails', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      prismaService.journey.update.mockRejectedValueOnce(
        new Error('database error')
      )
      await expect(
        resolver.journeyUpdate(ability, 'journeyId', {
          slug: 'untitled-journey'
        })
      ).rejects.toThrow('database error')
    })

    it('throws error if not authorized', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      await expect(
        resolver.journeyUpdate(ability, 'journeyId', { title: 'new title' })
      ).rejects.toThrow('user is not allowed to update journey')
    })

    it('throws error if not found', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.journeyUpdate(ability, 'journeyId', { title: 'new title' })
      ).rejects.toThrow('journey not found')
    })
  })

  describe('journeyPublish', () => {
    it('publishes a journey', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      await resolver.journeyPublish(ability, 'journeyId')
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: {
          status: JourneyStatus.published,
          publishedAt: new Date()
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.journeyPublish(ability, 'journeyId')
      ).rejects.toThrow('journey not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      await expect(
        resolver.journeyPublish(ability, 'journeyId')
      ).rejects.toThrow('user is not allowed to publish journey')
    })
  })

  describe('journeyFeature', () => {
    it('updates featured date for journey', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      await resolver.journeyFeature(abilityWithPublisher, 'journeyId', true)
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: {
          featuredAt: new Date()
        }
      })
    })

    it('updates featured date to null', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      await resolver.journeyFeature(abilityWithPublisher, 'journeyId', false)
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: {
          featuredAt: null
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.journeyFeature(abilityWithPublisher, 'journeyId', true)
      ).rejects.toThrow('journey not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      await expect(
        resolver.journeyFeature(ability, 'journeyId', true)
      ).rejects.toThrow('user is not allowed to update featured date')
    })
  })

  describe('journeysArchive', () => {
    it('archives an array of journeys', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey])
      expect(
        await resolver.journeysArchive(accessibleJourneys, ['journeyId'])
      ).toEqual([journey])
      expect(prismaService.journey.updateMany).toHaveBeenCalledWith({
        where: { AND: [accessibleJourneys, { id: { in: ['journeyId'] } }] },
        data: { status: JourneyStatus.archived, archivedAt: new Date() }
      })
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: { AND: [accessibleJourneys, { id: { in: ['journeyId'] } }] }
      })
    })
  })

  describe('journeysDelete', () => {
    it('deletes an array of journeys', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey])
      expect(
        await resolver.journeysDelete(accessibleJourneys, ['journeyId'])
      ).toEqual([journey])
      expect(prismaService.journey.updateMany).toHaveBeenCalledWith({
        where: { AND: [accessibleJourneys, { id: { in: ['journeyId'] } }] },
        data: { status: JourneyStatus.deleted, deletedAt: new Date() }
      })
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: { AND: [accessibleJourneys, { id: { in: ['journeyId'] } }] }
      })
    })
  })

  describe('journeysTrash', () => {
    it('trashes an array of journeys', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey])
      expect(
        await resolver.journeysTrash(accessibleJourneys, ['journeyId'])
      ).toEqual([journey])
      expect(prismaService.journey.updateMany).toHaveBeenCalledWith({
        where: { AND: [accessibleJourneys, { id: { in: ['journeyId'] } }] },
        data: { status: JourneyStatus.trashed, trashedAt: new Date() }
      })
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: { AND: [accessibleJourneys, { id: { in: ['journeyId'] } }] }
      })
    })
  })

  describe('journeysRestore', () => {
    it('restores a Journey', async () => {
      prismaService.journey.findMany.mockResolvedValueOnce([journey])
      await resolver.journeysRestore(accessibleJourneys, ['journeyId'])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleJourneys, { id: { in: ['journeyId'] } }]
        }
      })
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { status: JourneyStatus.published, publishedAt: new Date() }
      })
    })
  })

  describe('journeyTemplate', () => {
    it('throws error if not found', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.journeyTemplate(ability, 'journeyId', { template: true })
      ).rejects.toThrow('journey not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      await expect(
        resolver.journeyTemplate(ability, 'journeyId', { template: true })
      ).rejects.toThrow(
        'user is not allowed to change journey to or from a template'
      )
    })

    describe('when user is publisher', () => {
      beforeEach(async () => {
        ability = await new AppCaslFactory().createAbility({
          id: 'userId',
          roles: ['publisher']
        })
      })

      it('updates template', async () => {
        prismaService.journey.findUnique.mockResolvedValueOnce(
          journeyWithUserTeam
        )
        await resolver.journeyTemplate(ability, 'journeyId', { template: true })
        expect(prismaService.journey.update).toHaveBeenCalledWith({
          where: { id: 'journeyId' },
          data: { template: true }
        })
      })
    })
  })

  describe('blocks', () => {
    it('returns blocks', async () => {
      prismaService.block.findMany.mockResolvedValueOnce([block])
      expect(await resolver.blocks(journey)).toEqual([
        { ...block, __typename: 'ImageBlock', typename: undefined }
      ])
      expect(prismaService.block.findMany).toHaveBeenCalledWith({
        include: {
          action: true
        },
        orderBy: {
          parentOrder: 'asc'
        },
        where: {
          journeyId: 'journeyId'
        }
      })
    })

    it('returns blocks without primaryImageBlock', async () => {
      const journeyWithPrimaryImageBlock = {
        ...journey,
        primaryImageBlockId: 'primaryImageBlockId'
      }
      prismaService.block.findMany.mockResolvedValueOnce([block])
      expect(await resolver.blocks(journeyWithPrimaryImageBlock)).toEqual([
        { ...block, __typename: 'ImageBlock', typename: undefined }
      ])
      expect(prismaService.block.findMany).toHaveBeenCalledWith({
        include: {
          action: true
        },
        orderBy: {
          parentOrder: 'asc'
        },
        where: {
          journeyId: 'journeyId',
          id: { not: 'primaryImageBlockId' }
        }
      })
    })
  })

  describe('chatButtons', () => {
    it('should return chatButtons', async () => {
      const chatButton: ChatButton = {
        id: 'chatButtonId',
        link: 'm.me/user',
        platform: 'facebook',
        journeyId: 'journeyId',
        updatedAt: new Date()
      }
      prismaService.chatButton.findMany.mockResolvedValueOnce([chatButton])
      expect(await resolver.chatButtons(journey)).toEqual([chatButton])
      expect(prismaService.chatButton.findMany).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId' }
      })
    })
  })

  describe('host', () => {
    it('returns host', async () => {
      const host: Host = {
        id: 'hostId',
        teamId: 'teamId',
        title: 'Bob & Sarah Jones',
        location: 'Dunedin, New Zealand',
        src1: 'avatar1-id',
        src2: 'avatar2-id',
        updatedAt: new Date()
      }
      const journeyWithHost = {
        ...journeyWithUserTeam,
        hostId: 'hostId'
      }
      prismaService.host.findUnique.mockResolvedValueOnce(host)
      expect(await resolver.host(journeyWithHost)).toEqual(host)
    })

    it('returns null if no hostId', async () => {
      expect(await resolver.host(journey)).toBeNull()
    })
  })

  describe('team', () => {
    it('returns team', async () => {
      const team: Team = {
        id: 'teamId',
        title: 'My Cool Team',
        publicTitle: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const journeyWithTeam = {
        ...journeyWithUserTeam,
        teamId: 'teamId'
      }
      prismaService.team.findUnique.mockResolvedValueOnce(team)
      expect(await resolver.team(journeyWithTeam)).toEqual(team)
      expect(prismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: journeyWithTeam.teamId }
      })
    })
  })

  describe('primaryImageBlock', () => {
    it('returns primaryImageBlock', async () => {
      const journeyWithPrimaryImageBlock = {
        ...journey,
        primaryImageBlockId: 'blockId'
      }
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      expect(
        await resolver.primaryImageBlock(journeyWithPrimaryImageBlock)
      ).toEqual(block)
      expect(prismaService.block.findUnique).toHaveBeenCalledWith({
        where: { id: 'blockId' },
        include: { action: true }
      })
    })

    it('returns null if no primaryImageBlockId', async () => {
      expect(await resolver.primaryImageBlock(journey)).toBeNull()
    })

    it('returns null if primaryImageBlock journey is not current journey', async () => {
      const journeyWithPrimaryImageBlockFromDifferentJourney = {
        ...journey,
        id: 'differentJourneyId',
        primaryImageBlockId: 'blockId'
      }
      expect(
        await resolver.primaryImageBlock(
          journeyWithPrimaryImageBlockFromDifferentJourney
        )
      ).toBeNull()
      expect(prismaService.block.findUnique).toHaveBeenCalledWith({
        where: { id: 'blockId' },
        include: { action: true }
      })
    })
  })

  describe('userJourneys', () => {
    it('returns userJourneys related to current journey', async () => {
      const userJourney = [
        {
          id: 'userJourneyId',
          userId: 'userId',
          journeyId: 'journeyId',
          updatedAt: new Date(),
          role: 'owner',
          openedAt: null,
          journey: {
            id: 'journeyId',
            teamId: 'teamId',
            userJourneys: [
              {
                id: 'userJourneyId',
                userId: 'userId',
                journeyId: 'journeyId',
                updatedAt: new Date(),
                role: 'owner',
                openedAt: null
              }
            ],
            team: {
              id: 'teamId',
              userTeams: [
                {
                  userId: 'userId',
                  role: UserTeamRole.manager,
                  teamId: 'teamId'
                }
              ]
            }
          }
        }
      ] as unknown as UserJourney

      const userJourneys = jest.fn().mockResolvedValue(userJourney)
      prismaService.journey.findUnique.mockReturnValue({
        ...journey,
        userJourneys
      } as unknown as Prisma.Prisma__JourneyClient<Journey>)

      expect(await resolver.userJourneys(journey, ability)).toEqual(userJourney)
    })

    it('returns empty user Journeys array when null', async () => {
      const userJourneys = jest.fn().mockResolvedValue(null)
      prismaService.journey.findUnique.mockReturnValue({
        ...journey,
        userJourneys
      } as unknown as Prisma.Prisma__JourneyClient<Journey>)

      expect(await resolver.userJourneys(journey, ability)).toEqual([])
    })

    it('returns empty user journeys array when ability is undefined', async () => {
      expect(await resolver.userJourneys(journey, undefined)).toEqual([])
    })
  })

  describe('language', () => {
    it('returns object for federation', async () => {
      expect(await resolver.language(journey)).toEqual({
        __typename: 'Language',
        id: '529'
      })
    })
  })

  describe('tags', () => {
    it('returns object for federation', async () => {
      const journeyTags = jest.fn().mockResolvedValue([
        {
          id: 'id',
          tagId: 'tagId',
          journeyId: 'journeyId'
        }
      ])
      prismaService.journey.findUnique.mockReturnValue({
        ...journey,
        journeyTags
      } as unknown as Prisma.Prisma__JourneyClient<Journey>)

      expect(await resolver.tags(journey)).toEqual([
        {
          __typename: 'Tag',
          id: 'tagId'
        }
      ])
    })

    it('returns object for federation with default when no tags', async () => {
      const journeyTags = jest.fn().mockResolvedValue(null)
      prismaService.journey.findUnique.mockReturnValue({
        ...journey,
        journeyTags
      } as unknown as Prisma.Prisma__JourneyClient<Journey>)

      expect(await resolver.tags({ ...journey })).toEqual([])
    })
  })
})
