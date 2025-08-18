import { Test, TestingModule } from '@nestjs/testing'
import { GraphQLResolveInfo, Kind } from 'graphql'
import { DeepMockProxy } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import {
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserTeamRole
} from '@core/prisma/journeys/client'

import {
  IdType,
  PlausibleStatsAggregateFilter,
  PlausibleStatsAggregateResponse,
  PlausibleStatsAggregateValue,
  PlausibleStatsBreakdownFilter,
  PlausibleStatsResponse,
  PlausibleStatsTimeseriesFilter
} from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { PlausibleResolver } from './plausible.resolver'
import { PlausibleService } from './plausible.service'

describe('PlausibleResolver', () => {
  let resolver: PlausibleResolver,
    plausibleService: DeepMockProxy<PlausibleService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey: Journey = {
    id: 'journeyId',
    slug: 'journey-slug',
    title: 'published',
    status: JourneyStatus.published,
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    creatorDescription: null,
    creatorImageBlockId: null,
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
    fromTemplateId: null,
    journeyCustomizationDescription: null
  }

  const journeyWithUserTeam = {
    ...journey,
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        PlausibleResolver,
        {
          provide: PlausibleService,
          useValue: {
            getStatsRealtimeVisitors: jest.fn(),
            getStatsAggregate: jest.fn(),
            getStatsBreakdown: jest.fn(),
            getStatsTimeseries: jest.fn()
          }
        },
        {
          provide: PrismaService,
          useValue: {
            journey: {
              findUnique: jest.fn()
            }
          }
        }
      ]
    }).compile()

    resolver = module.get<PlausibleResolver>(PlausibleResolver)
    plausibleService = module.get<PlausibleService>(
      PlausibleService
    ) as DeepMockProxy<PlausibleService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({
      id: 'userId'
    })
  })

  describe('journeysPlausibleStatsRealtimeVisitors', () => {
    it('should return realtime visitors', async () => {
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      const result = 10
      plausibleService.getStatsRealtimeVisitors.mockResolvedValue(result)

      const actual = await resolver.journeysPlausibleStatsRealtimeVisitors(
        ability,
        'id',
        IdType.slug
      )
      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { slug: 'id' },
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      })
      expect(plausibleService.getStatsRealtimeVisitors).toHaveBeenCalledWith(
        journey.id,
        'journey'
      )
      expect(actual).toEqual(result)
    })

    it('should load journey with journey id', async () => {
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      await resolver.journeysPlausibleStatsRealtimeVisitors(
        ability,
        'id',
        IdType.databaseId
      )
      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'id' },
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      })
    })

    it('should throw error when journey not found', async () => {
      prismaService.journey.findUnique.mockResolvedValue(null)
      await expect(
        resolver.journeysPlausibleStatsRealtimeVisitors(
          ability,
          'id',
          IdType.slug
        )
      ).rejects.toThrow('journey not found')
    })

    it('should throw error when user not allowed access to journey', async () => {
      prismaService.journey.findUnique.mockResolvedValue(journey)
      await expect(
        resolver.journeysPlausibleStatsRealtimeVisitors(
          ability,
          'id',
          IdType.slug
        )
      ).rejects.toThrow('user is not allowed to view journey')
    })
  })

  describe('journeysPlausibleStatsAggregate', () => {
    it('should return aggregate stats for field', async () => {
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      const mockAggregateValue: PlausibleStatsAggregateValue = {
        __typename: 'PlausibleStatsAggregateValue',
        value: 5
      }
      const result: PlausibleStatsAggregateResponse = {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: mockAggregateValue,
        visits: mockAggregateValue,
        pageviews: mockAggregateValue,
        viewsPerVisit: mockAggregateValue,
        bounceRate: mockAggregateValue,
        visitDuration: mockAggregateValue,
        events: mockAggregateValue,
        conversionRate: mockAggregateValue,
        timeOnPage: mockAggregateValue
      }
      plausibleService.getStatsAggregate.mockResolvedValue(result)
      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  kind: Kind.FIELD,
                  name: { value: 'events' }
                },
                {
                  kind: Kind.FIELD,
                  name: { value: 'property' }
                },
                {
                  kind: Kind.FIELD,
                  name: { value: '__typename' }
                }
              ]
            }
          }
        ]
      } as unknown as GraphQLResolveInfo
      const where: PlausibleStatsAggregateFilter = {}

      const actual = await resolver.journeysPlausibleStatsAggregate(
        ability,
        'id',
        IdType.slug,
        info,
        where
      )

      expect(plausibleService.getStatsAggregate).toHaveBeenCalledWith(
        journey.id,
        'journey',
        {
          metrics: 'events'
        }
      )
      expect(actual).toEqual(result)
    })

    it('should return aggregate stats for fragment spread', async () => {
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      const mockAggregateValue: PlausibleStatsAggregateValue = {
        __typename: 'PlausibleStatsAggregateValue',
        value: 5
      }
      const result: PlausibleStatsAggregateResponse = {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: mockAggregateValue,
        visits: mockAggregateValue,
        pageviews: mockAggregateValue,
        viewsPerVisit: mockAggregateValue,
        bounceRate: mockAggregateValue,
        visitDuration: mockAggregateValue,
        events: mockAggregateValue,
        conversionRate: mockAggregateValue,
        timeOnPage: mockAggregateValue
      }
      plausibleService.getStatsAggregate.mockResolvedValue(result)
      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { value: 'fragmentSpread' }
                }
              ]
            }
          }
        ],
        fragments: {
          fragmentSpread: {
            selectionSet: {
              selections: [
                {
                  kind: Kind.FIELD,
                  name: { value: 'visits' }
                }
              ]
            }
          }
        }
      } as unknown as GraphQLResolveInfo
      const where: PlausibleStatsAggregateFilter = {}

      const actual = await resolver.journeysPlausibleStatsAggregate(
        ability,
        'id',
        IdType.slug,
        info,
        where
      )

      expect(plausibleService.getStatsAggregate).toHaveBeenCalledWith(
        journey.id,
        'journey',
        {
          metrics: 'visits'
        }
      )
      expect(actual).toEqual(result)
    })

    it('should return aggregate stats for inline fragment', async () => {
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      const mockAggregateValue: PlausibleStatsAggregateValue = {
        __typename: 'PlausibleStatsAggregateValue',
        value: 5
      }
      const result: PlausibleStatsAggregateResponse = {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: mockAggregateValue,
        visits: mockAggregateValue,
        pageviews: mockAggregateValue,
        viewsPerVisit: mockAggregateValue,
        bounceRate: mockAggregateValue,
        visitDuration: mockAggregateValue,
        events: mockAggregateValue,
        conversionRate: mockAggregateValue,
        timeOnPage: mockAggregateValue
      }
      plausibleService.getStatsAggregate.mockResolvedValue(result)
      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  kind: Kind.INLINE_FRAGMENT,
                  name: { value: 'inlineFragment' }
                }
              ]
            }
          }
        ]
      } as unknown as GraphQLResolveInfo
      const where: PlausibleStatsAggregateFilter = {}

      const actual = await resolver.journeysPlausibleStatsAggregate(
        ability,
        'id',
        IdType.slug,
        info,
        where
      )

      expect(plausibleService.getStatsAggregate).toHaveBeenCalledWith(
        journey.id,
        'journey',
        {
          metrics: 'visitors'
        }
      )
      expect(actual).toEqual(result)
    })
  })

  describe('journeysPlausibleStatsBreakdown', () => {
    it('should return breakdown stats', async () => {
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      const result: PlausibleStatsResponse[] = [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'property',
          visitors: 5,
          visits: 5,
          pageviews: 5,
          viewsPerVisit: 5,
          bounceRate: 5,
          visitDuration: 5,
          events: 5,
          conversionRate: 5,
          timeOnPage: 5
        }
      ]
      plausibleService.getStatsBreakdown.mockResolvedValue(result)
      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  kind: Kind.FIELD,
                  name: { value: 'events' }
                }
              ]
            }
          }
        ]
      } as unknown as GraphQLResolveInfo
      const where: PlausibleStatsBreakdownFilter = {
        property: 'property'
      }

      const actual = await resolver.journeysPlausibleStatsBreakdown(
        ability,
        'id',
        IdType.slug,
        info,
        where
      )

      expect(plausibleService.getStatsBreakdown).toHaveBeenCalledWith(
        journey.id,
        'journey',
        {
          metrics: 'events',
          property: 'property'
        }
      )
      expect(actual).toEqual(result)
    })
  })

  describe('journeysPlausibleStatsTimeseries', () => {
    it('should return timeseries stats', async () => {
      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      const result: PlausibleStatsResponse[] = [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'property',
          visitors: 5,
          visits: 5,
          pageviews: 5,
          viewsPerVisit: 5,
          bounceRate: 5,
          visitDuration: 5,
          events: 5,
          conversionRate: 5,
          timeOnPage: 5
        }
      ]
      plausibleService.getStatsTimeseries.mockResolvedValue(result)
      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  kind: Kind.FIELD,
                  name: { value: 'property' }
                }
              ]
            }
          }
        ]
      } as unknown as GraphQLResolveInfo
      const where: PlausibleStatsTimeseriesFilter = {}

      const actual = await resolver.journeysPlausibleStatsTimeseries(
        ability,
        'id',
        IdType.slug,
        info,
        where
      )

      expect(plausibleService.getStatsTimeseries).toHaveBeenCalledWith(
        journey.id,
        'journey',
        {
          metrics: 'visitors'
        }
      )
      expect(actual).toEqual(result)
    })
  })
})
