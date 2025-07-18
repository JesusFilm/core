import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import {
  Journey,
  JourneyTheme,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import {
  JourneyThemeCreateInput,
  JourneyThemeUpdateInput
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyThemeResolver } from './journeyTheme.resolver'

describe('JourneyThemeResolver', () => {
  let resolver: JourneyThemeResolver
  let prismaService: DeepMockProxy<PrismaService>
  let ability: AppAbility

  const journeyTheme: JourneyTheme = {
    id: 'journeyThemeId',
    journeyId: 'journeyId',
    userId: 'userId',
    headerFont: 'Arial',
    bodyFont: 'Roboto',
    labelFont: 'Montserrat',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z')
  }

  const journey: Journey = {
    id: 'journeyId',
    slug: 'journey-slug',
    title: 'Test Journey',
    status: 'published',
    languageId: '529',
    themeMode: 'light',
    themeName: 'base',
    description: null,
    creatorDescription: null,
    creatorImageBlockId: null,
    primaryImageBlockId: null,
    teamId: 'teamId',
    publishedAt: new Date('2023-01-01T00:00:00Z'),
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    archivedAt: null,
    trashedAt: null,
    featuredAt: null,
    deletedAt: null,
    seoTitle: null,
    seoDescription: null,
    template: false,
    hostId: null,
    strategySlug: null,
    plausibleToken: null,
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    showHosts: null,
    showChatButtons: null,
    showReactionButtons: null,
    showLogo: null,
    showMenu: null,
    showDisplayTitle: null,
    menuButtonIcon: null,
    logoImageBlockId: null,
    menuStepBlockId: null,
    socialNodeX: null,
    socialNodeY: null,
    fromTemplateId: null
  }

  const journeyWithUserTeam = {
    ...journey,
    userJourneys: [{ userId: 'userId', role: UserJourneyRole.owner }],
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyThemeResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<JourneyThemeResolver>(JourneyThemeResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({
      id: 'userId'
    })
  })

  describe('journeyTheme', () => {
    it('should return a journey theme', async () => {
      const mockJourneyThemeWithJourney = {
        ...journeyTheme,
        journey
      }

      prismaService.journeyTheme.findUnique.mockResolvedValue(
        mockJourneyThemeWithJourney
      )

      await expect(resolver.journeyTheme('journeyId')).resolves.toEqual(
        mockJourneyThemeWithJourney
      )
      expect(prismaService.journeyTheme.findUnique).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId' },
        include: {
          journey: true
        }
      })
    })

    it('should throw an error if journey theme not found', async () => {
      prismaService.journeyTheme.findUnique.mockResolvedValue(null)

      await expect(resolver.journeyTheme('journeyId')).rejects.toThrow(
        'journey theme not found'
      )
    })
  })

  describe('journeyThemeCreate', () => {
    it('should create a journey theme', async () => {
      const input: JourneyThemeCreateInput = {
        journeyId: 'journeyId',
        headerFont: 'Arial',
        bodyFont: 'Roboto',
        labelFont: 'Montserrat'
      }

      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      prismaService.$transaction.mockImplementation(async (callback) => {
        prismaService.journeyTheme.findUnique.mockResolvedValueOnce(null)
        prismaService.journeyTheme.create.mockResolvedValueOnce(journeyTheme)
        return await callback(prismaService)
      })

      await expect(
        resolver.journeyThemeCreate(ability, input, 'userId')
      ).resolves.toEqual(journeyTheme)

      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })
    })

    it('should throw an error if journey not found', async () => {
      const input: JourneyThemeCreateInput = {
        journeyId: 'journeyId',
        headerFont: 'Arial',
        bodyFont: 'Roboto',
        labelFont: 'Montserrat'
      }

      prismaService.journey.findUnique.mockResolvedValueOnce(null)

      await expect(
        resolver.journeyThemeCreate(ability, input, 'userId')
      ).rejects.toThrow('journey not found')
    })

    it('should throw an error if user is not allowed to create journey theme', async () => {
      const input: JourneyThemeCreateInput = {
        journeyId: 'journeyId',
        headerFont: 'Arial',
        bodyFont: 'Roboto',
        labelFont: 'Montserrat'
      }

      const unauthorizedJourney = {
        ...journey,
        userJourneys: [],
        team: { userTeams: [] }
      }

      prismaService.journey.findUnique.mockResolvedValueOnce(
        unauthorizedJourney
      )

      await expect(
        resolver.journeyThemeCreate(ability, input, 'userId')
      ).rejects.toThrow('user is not allowed to create journey theme')
    })

    it('should throw an error if journey already has a theme', async () => {
      const input: JourneyThemeCreateInput = {
        journeyId: 'journeyId',
        headerFont: 'Arial',
        bodyFont: 'Roboto',
        labelFont: 'Montserrat'
      }

      prismaService.journey.findUnique.mockResolvedValueOnce(
        journeyWithUserTeam
      )
      prismaService.$transaction.mockImplementation(async (callback) => {
        prismaService.journeyTheme.findUnique.mockResolvedValueOnce(
          journeyTheme
        )
        return await callback(prismaService)
      })

      await expect(
        resolver.journeyThemeCreate(ability, input, 'userId')
      ).rejects.toThrow('journey already has a theme')
    })
  })

  describe('journeyThemeUpdate', () => {
    it('should update a journey theme', async () => {
      const input: JourneyThemeUpdateInput = {
        headerFont: 'Helvetica',
        bodyFont: 'Times New Roman',
        labelFont: 'Nunito'
      }

      const updatedJourneyTheme = {
        ...journeyTheme,
        headerFont: 'Helvetica',
        bodyFont: 'Times New Roman',
        labelFont: 'Nunito'
      }

      const mockJourneyThemeWithJourney = {
        ...journeyTheme,
        journey: journeyWithUserTeam
      }

      prismaService.journeyTheme.findUnique.mockResolvedValueOnce(
        mockJourneyThemeWithJourney
      )
      prismaService.journeyTheme.update.mockResolvedValueOnce(
        updatedJourneyTheme
      )

      await expect(
        resolver.journeyThemeUpdate(ability, 'journeyThemeId', input)
      ).resolves.toEqual(updatedJourneyTheme)

      expect(prismaService.journeyTheme.update).toHaveBeenCalledWith({
        where: { id: 'journeyThemeId' },
        data: {
          headerFont: 'Helvetica',
          bodyFont: 'Times New Roman',
          labelFont: 'Nunito'
        }
      })
    })

    it('should throw an error if journey theme not found', async () => {
      const input: JourneyThemeUpdateInput = {
        headerFont: 'Helvetica',
        bodyFont: 'Times New Roman',
        labelFont: 'Courier'
      }

      prismaService.journeyTheme.findUnique.mockResolvedValue(null)

      await expect(
        resolver.journeyThemeUpdate(ability, 'journeyThemeId', input)
      ).rejects.toThrow('journey theme not found')
    })

    it('should throw an error if user is not allowed to update journey theme', async () => {
      const input: JourneyThemeUpdateInput = {
        headerFont: 'Helvetica',
        bodyFont: 'Times New Roman',
        labelFont: 'Courier'
      }

      const unauthorizedJourneyTheme = {
        ...journeyTheme,
        journey: {
          ...journey,
          userJourneys: [],
          team: { userTeams: [] }
        }
      }

      prismaService.journeyTheme.findUnique.mockResolvedValue(
        unauthorizedJourneyTheme
      )

      await expect(
        resolver.journeyThemeUpdate(ability, 'journeyThemeId', input)
      ).rejects.toThrow('user is not allowed to update journey theme')
    })
  })

  describe('journeyThemeDelete', () => {
    it('should delete a journey theme', async () => {
      const mockJourneyThemeWithJourney = {
        ...journeyTheme,
        journey: journeyWithUserTeam
      }

      prismaService.journeyTheme.findUnique.mockResolvedValue(
        mockJourneyThemeWithJourney
      )
      prismaService.journeyTheme.delete.mockResolvedValue(journeyTheme)

      await expect(
        resolver.journeyThemeDelete(ability, 'journeyThemeId')
      ).resolves.toEqual(journeyTheme)

      expect(prismaService.journeyTheme.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyThemeId' },
        include: {
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      expect(prismaService.journeyTheme.delete).toHaveBeenCalledWith({
        where: { id: 'journeyThemeId' }
      })
    })

    it('should throw an error if journey theme not found', async () => {
      prismaService.journeyTheme.findUnique.mockResolvedValue(null)

      await expect(
        resolver.journeyThemeDelete(ability, 'journeyThemeId')
      ).rejects.toThrow('journey theme not found')
    })

    it('should throw an error if user is not allowed to delete journey theme', async () => {
      const unauthorizedJourneyTheme = {
        ...journeyTheme,
        journey: {
          ...journey,
          userJourneys: [],
          team: { userTeams: [] }
        }
      }

      prismaService.journeyTheme.findUnique.mockResolvedValue(
        unauthorizedJourneyTheme
      )

      await expect(
        resolver.journeyThemeDelete(ability, 'journeyThemeId')
      ).rejects.toThrow('user is not allowed to delete journey theme')
    })
  })
})
