import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import {
  Journey,
  JourneyCustomizationField,
  Team,
  UserJourney,
  UserJourneyRole,
  UserTeam,
  UserTeamRole
} from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { JourneyCustomizationFieldInput } from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { parseCustomizationFieldsFromString } from '../../lib/parseCustomizationFieldsFromString'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyCustomizationFieldResolver } from './journeyCustomizationField.resolver'

// Mock the parseCustomizationFieldsFromString utility
jest.mock('../../lib/parseCustomizationFieldsFromString')

const mockParseCustomizationFieldsFromString =
  parseCustomizationFieldsFromString as jest.MockedFunction<
    typeof parseCustomizationFieldsFromString
  >

describe('JourneyCustomizationFieldResolver', () => {
  let resolver: JourneyCustomizationFieldResolver
  let prismaService: DeepMockProxy<PrismaService>
  let ability: AppAbility
  let abilityWithPublisher: AppAbility

  const mockJourney: Journey = {
    id: 'journey-id',
    slug: 'test-journey',
    title: 'Test Journey',
    status: 'published',
    languageId: '529',
    themeMode: 'light',
    themeName: 'base',
    description: null,
    creatorDescription: null,
    creatorImageBlockId: null,
    primaryImageBlockId: null,
    teamId: 'team-id',
    publishedAt: new Date('2021-11-19T12:34:56.647Z'),
    createdAt: new Date('2021-11-19T12:34:56.647Z'),
    updatedAt: new Date('2021-11-19T12:34:56.647Z'),
    archivedAt: null,
    trashedAt: null,
    featuredAt: null,
    deletedAt: null,
    seoTitle: null,
    seoDescription: null,
    template: true,
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
    journeyCustomizationDescription: null,
    guestJourney: null
  }

  const mockTeam: Team = {
    id: 'team-id',
    title: 'Test Team',
    publicTitle: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    plausibleToken: null
  }

  const mockUserJourney: UserJourney = {
    id: 'user-journey-id',
    userId: 'userId',
    journeyId: 'journey-id',
    role: UserJourneyRole.owner,
    updatedAt: new Date(),
    openedAt: null
  }

  const mockUserTeam: UserTeam = {
    id: 'user-team-id',
    userId: 'userId',
    teamId: 'team-id',
    role: UserTeamRole.manager,
    updatedAt: new Date(),
    createdAt: new Date()
  }

  const journeyWithUserTeam = {
    ...mockJourney,
    userJourneys: [mockUserJourney],
    team: {
      ...mockTeam,
      userTeams: [mockUserTeam]
    }
  }

  const journeyWithoutUserTeam = {
    ...mockJourney,
    userJourneys: [],
    team: {
      ...mockTeam,
      userTeams: []
    }
  }

  const mockJourneyCustomizationField: JourneyCustomizationField = {
    id: 'field-id',
    journeyId: 'journey-id',
    key: 'name',
    value: 'John Doe',
    defaultValue: 'John Doe'
  }

  const mockJourneyCustomizationFieldInput: JourneyCustomizationFieldInput = {
    id: 'field-id',
    key: 'name',
    value: 'Updated Name'
  }

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-11-19T12:34:56.647Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyCustomizationFieldResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<JourneyCustomizationFieldResolver>(
      JourneyCustomizationFieldResolver
    )
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

  describe('journeyCustomizationFieldPublisherUpdate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should update journey customization fields for publisher', async () => {
      const journeyId = 'journey-id'
      const string = 'Hello {{ name: John }}!'
      const parsedFields = [
        {
          id: 'field-id',
          journeyId: 'journey-id',
          key: 'name',
          value: 'John',
          defaultValue: 'John'
        }
      ]

      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      mockParseCustomizationFieldsFromString.mockReturnValue(parsedFields)
      prismaService.journeyCustomizationField.findMany.mockResolvedValue([
        mockJourneyCustomizationField
      ])

      const result = await resolver.journeyCustomizationFieldPublisherUpdate(
        abilityWithPublisher,
        journeyId,
        string
      )

      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { id: journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      expect(mockParseCustomizationFieldsFromString).toHaveBeenCalledWith(
        string,
        journeyId
      )

      expect(prismaService.$transaction).toHaveBeenCalled()
      expect(
        prismaService.journeyCustomizationField.deleteMany
      ).toHaveBeenCalledWith({
        where: { journeyId: 'journey-id' }
      })
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journey-id' },
        data: {
          journeyCustomizationDescription: string
        }
      })
      expect(
        prismaService.journeyCustomizationField.createMany
      ).toHaveBeenCalledWith({
        data: parsedFields
      })

      expect(result).toEqual([mockJourneyCustomizationField])
    })

    it('should throw error if journey not found', async () => {
      const journeyId = 'non-existent-journey'
      const string = 'Hello {{ name: John }}!'

      prismaService.journey.findUnique.mockResolvedValue(null)

      await expect(
        resolver.journeyCustomizationFieldPublisherUpdate(
          ability,
          journeyId,
          string
        )
      ).rejects.toThrow('journey not found')
    })

    it('should throw error if user is not authorized to manage template', async () => {
      const journeyId = 'journey-id'
      const string = 'Hello {{ name: John }}!'

      prismaService.journey.findUnique.mockResolvedValue(journeyWithoutUserTeam)

      await expect(
        resolver.journeyCustomizationFieldPublisherUpdate(
          ability,
          journeyId,
          string
        )
      ).rejects.toThrow(
        'user is not allowed to update journey customization field'
      )
    })

    it('should throw error if journey is not a template', async () => {
      const journeyId = 'journey-id'
      const string = 'Hello {{ name: John }}!'
      const nonTemplateJourney = {
        ...journeyWithUserTeam,
        template: false
      }

      prismaService.journey.findUnique.mockResolvedValue(nonTemplateJourney)

      await expect(
        resolver.journeyCustomizationFieldPublisherUpdate(
          abilityWithPublisher,
          journeyId,
          string
        )
      ).rejects.toThrow('journey is not a template')
    })

    it('should handle empty string input', async () => {
      const journeyId = 'journey-id'
      const string = ''

      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      mockParseCustomizationFieldsFromString.mockReturnValue([])
      prismaService.journeyCustomizationField.findMany.mockResolvedValue([])

      const result = await resolver.journeyCustomizationFieldPublisherUpdate(
        abilityWithPublisher,
        journeyId,
        string
      )

      expect(mockParseCustomizationFieldsFromString).toHaveBeenCalledWith(
        string,
        journeyId
      )
      expect(result).toEqual([])
    })

    it('should handle string with no customization fields', async () => {
      const journeyId = 'journey-id'
      const string = 'This is a regular string without customization fields'

      prismaService.journey.findUnique.mockResolvedValue(journeyWithUserTeam)
      mockParseCustomizationFieldsFromString.mockReturnValue([])
      prismaService.journeyCustomizationField.findMany.mockResolvedValue([])

      const result = await resolver.journeyCustomizationFieldPublisherUpdate(
        abilityWithPublisher,
        journeyId,
        string
      )

      expect(mockParseCustomizationFieldsFromString).toHaveBeenCalledWith(
        string,
        journeyId
      )
      expect(result).toEqual([])
    })
  })

  describe('journeyCustomizationFieldUserUpdate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should update journey customization fields for user', async () => {
      const journeyId = 'journey-id'
      const input: JourneyCustomizationFieldInput[] = [
        mockJourneyCustomizationFieldInput
      ]

      const journeyWithCustomizationFields = {
        ...journeyWithUserTeam,
        journeyCustomizationFields: [mockJourneyCustomizationField]
      }

      prismaService.journey.findUnique.mockResolvedValue(
        journeyWithCustomizationFields
      )
      prismaService.journeyCustomizationField.findMany.mockResolvedValue([
        {
          ...mockJourneyCustomizationField,
          value: 'Updated Name'
        }
      ])

      const result = await resolver.journeyCustomizationFieldUserUpdate(
        ability,
        journeyId,
        input
      )

      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { id: journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } },
          journeyCustomizationFields: true
        }
      })

      expect(prismaService.$transaction).toHaveBeenCalled()
      expect(
        prismaService.journeyCustomizationField.update
      ).toHaveBeenCalledWith({
        where: { id: 'field-id' },
        data: { value: 'Updated Name' }
      })

      expect(result).toEqual([
        {
          ...mockJourneyCustomizationField,
          value: 'Updated Name'
        }
      ])
    })

    it('should throw error if journey not found', async () => {
      const journeyId = 'non-existent-journey'
      const input: JourneyCustomizationFieldInput[] = [
        mockJourneyCustomizationFieldInput
      ]

      prismaService.journey.findUnique.mockResolvedValue(null)

      await expect(
        resolver.journeyCustomizationFieldUserUpdate(ability, journeyId, input)
      ).rejects.toThrow('journey not found')
    })

    it('should throw error if user is not authorized to manage journey', async () => {
      const journeyId = 'journey-id'
      const input: JourneyCustomizationFieldInput[] = [
        mockJourneyCustomizationFieldInput
      ]

      prismaService.journey.findUnique.mockResolvedValue(journeyWithoutUserTeam)

      await expect(
        resolver.journeyCustomizationFieldUserUpdate(ability, journeyId, input)
      ).rejects.toThrow(
        'user is not allowed to update journey customization field'
      )
    })

    it('should handle multiple field updates', async () => {
      const journeyId = 'journey-id'
      const input: JourneyCustomizationFieldInput[] = [
        { id: 'field-1', key: 'name', value: 'John' },
        { id: 'field-2', key: 'email', value: 'john@example.com' }
      ]

      const journeyWithCustomizationFields = {
        ...journeyWithUserTeam,
        journeyCustomizationFields: [
          { ...mockJourneyCustomizationField, id: 'field-1' },
          { ...mockJourneyCustomizationField, id: 'field-2', key: 'email' }
        ]
      }

      prismaService.journey.findUnique.mockResolvedValue(
        journeyWithCustomizationFields
      )
      prismaService.journeyCustomizationField.findMany.mockResolvedValue([
        { ...mockJourneyCustomizationField, id: 'field-1', value: 'John' },
        {
          ...mockJourneyCustomizationField,
          id: 'field-2',
          key: 'email',
          value: 'john@example.com'
        }
      ])

      const result = await resolver.journeyCustomizationFieldUserUpdate(
        ability,
        journeyId,
        input
      )

      expect(
        prismaService.journeyCustomizationField.update
      ).toHaveBeenCalledTimes(2)
      expect(
        prismaService.journeyCustomizationField.update
      ).toHaveBeenNthCalledWith(1, {
        where: { id: 'field-1' },
        data: { value: 'John' }
      })
      expect(
        prismaService.journeyCustomizationField.update
      ).toHaveBeenNthCalledWith(2, {
        where: { id: 'field-2' },
        data: { value: 'john@example.com' }
      })

      expect(result).toHaveLength(2)
    })

    it('should handle empty input array', async () => {
      const journeyId = 'journey-id'
      const input: JourneyCustomizationFieldInput[] = []

      const journeyWithCustomizationFields = {
        ...journeyWithUserTeam,
        journeyCustomizationFields: []
      }

      prismaService.journey.findUnique.mockResolvedValue(
        journeyWithCustomizationFields
      )
      prismaService.journeyCustomizationField.findMany.mockResolvedValue([])

      const result = await resolver.journeyCustomizationFieldUserUpdate(
        ability,
        journeyId,
        input
      )

      expect(prismaService.$transaction).toHaveBeenCalled()
      expect(
        prismaService.journeyCustomizationField.update
      ).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should handle null values in input', async () => {
      const journeyId = 'journey-id'
      const input: JourneyCustomizationFieldInput[] = [
        { id: 'field-id', key: 'name', value: null }
      ]

      const journeyWithCustomizationFields = {
        ...journeyWithUserTeam,
        journeyCustomizationFields: [mockJourneyCustomizationField]
      }

      prismaService.journey.findUnique.mockResolvedValue(
        journeyWithCustomizationFields
      )
      prismaService.journeyCustomizationField.findMany.mockResolvedValue([
        { ...mockJourneyCustomizationField, value: null }
      ])

      const result = await resolver.journeyCustomizationFieldUserUpdate(
        ability,
        journeyId,
        input
      )

      expect(
        prismaService.journeyCustomizationField.update
      ).toHaveBeenCalledWith({
        where: { id: 'field-id' },
        data: { value: null }
      })

      expect(result).toEqual([
        { ...mockJourneyCustomizationField, value: null }
      ])
    })
  })
})
