import { ApolloClient, MutationResult, gql } from '@apollo/client'
import { BullModule, getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import axios, { AxiosInstance } from 'axios'

import {
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '.prisma/api-journeys-client'

import { PrismaService } from '../../lib/prisma.service'

import { PlausibleService, SITE_CREATE } from './plausible.service'

jest.mock('@apollo/client')
// jest.mock('axios')
// jest.mock('axios', () => ({
//   __esModule: true,
//   ...jest.requireActual('axios'),
//   create: jest.fn(),
//   get: jest.fn()
// }))

// const mockedAxios = axios as jest.Mocked<typeof axios>
// const mockedAxiosCreate = axios.create as jest.MockedFunction<
//   typeof axios.create
// >
// const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>

const team = {
  __typename: 'Team',
  id: 'team.id',
  publicTitle: 'title',
  createAt: '2021-02-18T00:00:00Z',
  updateAt: '2021-02-18T00:00:00Z',
  userTeams: [],
  customDomains: [],
  plausibleToken: 'token'
}

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
  plausibleToken: null
}

describe('PlausibleService', () => {
  let service: PlausibleService,
    prismaService: PrismaService,
    plausibleQueue: { add: jest.Mock }

  beforeEach(async () => {
    plausibleQueue = {
      add: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [BullModule.registerQueue({ name: 'api-journeys-plausible' })],
      providers: [
        PlausibleService,
        {
          provide: PrismaService,
          useValue: {
            journey: {
              findMany: jest.fn(),
              update: jest.fn()
            },
            team: {
              findMany: jest.fn(),
              update: jest.fn()
            }
          }
        }
      ]
    })
      .overrideProvider(getQueueToken('api-journeys-plausible'))
      .useValue(plausibleQueue)
      .compile()
    service = module.get<PlausibleService>(PlausibleService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createSites', () => {
    it('should create journey and team sites for existing journeys and teams without a site', async () => {
      service.createTeamSite = jest.fn()
      service.createJourneySite = jest.fn()

      prismaService.team.findMany = jest.fn().mockResolvedValueOnce([team])
      prismaService.journey.findMany = jest
        .fn()
        .mockResolvedValueOnce([journey])

      await service.createSites()

      expect(service.createTeamSite).toHaveBeenCalledTimes(1)
      expect(service.createTeamSite).toHaveBeenCalledWith({ teamId: team.id })
      expect(service.createJourneySite).toHaveBeenCalledTimes(1)
      expect(service.createJourneySite).toHaveBeenCalledWith({
        journeyId: journey.id
      })
    })
  })

  describe('createJourneySite', () => {
    it('should create a journey site', async () => {
      service.createSite = jest.fn().mockResolvedValue({
        __typename: 'MutationSiteCreateSuccess',
        data: {
          sharedLinks: [
            {
              slug: 'slug'
            }
          ]
        }
      })

      await service.createJourneySite({ journeyId: journey.id })

      expect(service.createSite).toHaveBeenCalledWith(
        `api-journeys-journey-${journey.id}`
      )
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: journey.id },
        data: {
          plausibleToken: 'slug'
        }
      })
    })
  })

  describe('createTeamSite', () => {
    it('should create a team site', async () => {
      service.createSite = jest.fn().mockResolvedValue({
        __typename: 'MutationSiteCreateSuccess',
        data: {
          sharedLinks: [
            {
              slug: 'slug'
            }
          ]
        }
      })

      await service.createTeamSite({ teamId: team.id })

      expect(service.createSite).toHaveBeenCalledWith(
        `api-journeys-team-${team.id}`
      )
      expect(prismaService.team.update).toHaveBeenCalledWith({
        where: { id: team.id },
        data: {
          plausibleToken: 'slug'
        }
      })
    })
  })

  describe('createSite', () => {
    it('should create a site', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              siteCreate: {
                id: 'siteId',
                slug: 'site-slug'
              }
            }
          } as unknown as MutationResult<unknown>)
      )

      const response = await service.createSite('site-name')
      expect(jest.spyOn(ApolloClient.prototype, 'mutate')).toHaveBeenCalledWith(
        {
          mutation: SITE_CREATE,
          variables: {
            input: {
              domain: 'site-name',
              goals: [
                'footerThumbsUpButtonClick',
                'footerThumbsDownButtonClick',
                'shareButtonClick',
                'pageview',
                'navigatePreviousStep',
                'navigateNextStep',
                'buttonClick',
                'chatButtonClick',
                'footerChatButtonClick',
                'radioQuestionSubmit',
                'signUpSubmit',
                'textResponseSubmit',
                'videoPlay',
                'videoPause',
                'videoExpand',
                'videoCollapse',
                'videoStart',
                'videoProgress25',
                'videoProgress50',
                'videoProgress75',
                'videoComplete',
                'videoTrigger'
              ]
            }
          }
        }
      )
      expect(response).toEqual({
        id: 'siteId',
        slug: 'site-slug'
      })
    })
  })

  describe('getStatsRealtimeVisitors', () => {
    it('should return real time visitors for journey', async () => {
      const response = 10
      const mockPlausibleClient = {
        get: jest.fn()
      } as unknown as AxiosInstance

      // axios.get = jest.fn().mockResolvedValue({ data: response })
      // const axiosClient = axios.create()
      // axiosClient.get = jest.fn().mockResolvedValue({ data: response })
      // axios.create = jest.fn().mockResolvedValue({
      //   get: jest.fn().mockResolvedValue(mockPlausibleClient)
      // })
      // mockedAxios.create.mockReturnValue(mockPlausibleClient)
      // mockedAxios.get.mockResolvedValue({ data: response })
      // mockedAxiosCreate.mockResolvedValue(mockPlausibleClient)
      // mockedAxiosGet.mockResolvedValue({ data: response })
      // mockedAxios.create.mockImplementation(() => mockPlausibleClient)
      // mockedAxios.get.mockResolvedValue({ data: response })

      // mockedAxios.create.mockImplementation(
      //   async () => await Promise.resolve(mockPlausibleClient)
      // )

      const actual = await service.getStatsRealtimeVisitors(
        journey.id,
        'journey'
      )
      expect(actual).toEqual(response)
    })
  })

  describe('getStatsAggregate', () => {})

  describe('getStatsBreakdown', () => {})

  describe('getStatsTimeseries', () => {})
})
