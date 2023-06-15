import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { Journey, UserTeamRole } from '.prisma/api-journeys-client'
import {
  IdType,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyService } from './userJourney.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('UserJourneyService', () => {
  let service: UserJourneyService, prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserJourneyService, JourneyService, PrismaService]
    }).compile()

    service = module.get<UserJourneyService>(UserJourneyService)
    prisma = module.get<PrismaService>(PrismaService)
    prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(journey)
    prisma.userTeam.upsert = jest.fn()
    prisma.userJourney.create = jest
      .fn()
      .mockReturnValueOnce(userJourneyInvited)
    prisma.userJourney.findUnique = jest
      .fn()
      .mockResolvedValue(userJourneyInvited)
    prisma.userJourney.update = jest
      .fn()
      .mockReturnValueOnce(userJourneyInvited)
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const userJourney = {
    id: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.editor
  }

  const userJourneyInvited = {
    id: '2',
    userId: '2',
    journeyId: '1',
    role: UserJourneyRole.inviteRequested
  }

  const journey = {
    id: '1',
    title: 'published',
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug',
    createdAt: new Date(),
    status: JourneyStatus.published,
    teamId: 'teamId',
    chatButtons: []
  } as unknown as Journey

  const userJourneyOwner = {
    ...userJourney,
    role: UserJourneyRole.owner
  }

  describe('requestAccess', () => {
    it('throws UserInputError when journey does not exist', async () => {
      prisma.journey.findUnique = jest.fn().mockResolvedValueOnce(null)
      await service
        .requestAccess('randomJourneyId', IdType.databaseId, '1')
        .catch((error) => {
          expect(error.message).toEqual('journey does not exist')
        })
    })

    it('creates a UserJourney when journeyId is databaseId', async () => {
      mockUuidv4.mockReturnValueOnce(userJourneyInvited.id)
      expect(
        await service.requestAccess(journey.id, IdType.databaseId, '1')
      ).toEqual(userJourneyInvited)
    })
    it('creates a UserJourney when journeyId is slug', async () => {
      mockUuidv4.mockReturnValueOnce(userJourneyInvited.id)
      prisma.userJourney.findUnique = jest.fn().mockResolvedValueOnce(null)
      prisma.journey.findFirst = jest.fn().mockResolvedValueOnce(journey)

      expect(
        await service.requestAccess(journey.slug, IdType.slug, '1')
      ).toEqual(userJourneyInvited)
    })

    it('returns an existing a UserJourney access request ', async () => {
      expect(
        await service.requestAccess(journey.id, IdType.databaseId, '1')
      ).toEqual(userJourneyInvited)
    })

    it('returns undefined if UserJourney role access already granted', async () => {
      prisma.userJourney.findUnique = jest
        .fn()
        .mockResolvedValueOnce(userJourney)
      expect(
        await service.requestAccess(journey.id, IdType.databaseId, '1')
      ).toEqual(undefined)
    })
  })

  describe('approveAccess', () => {
    it('should throw UserInputError if userJourney does not exist', async () => {
      prisma.userJourney.findUnique = jest.fn().mockReturnValueOnce(null)
      await service.approveAccess('wrongId', '1').catch((error) => {
        expect(error.message).toEqual('userJourney does not exist')
      })
    })

    it('should throw Auth error if approver an invitee', async () => {
      await service
        .approveAccess(userJourneyInvited.id, userJourneyInvited.userId)
        .catch((error) => {
          expect(error.message).toEqual(
            'You do not have permission to approve access'
          )
        })
    })

    it('updates a UserJourney to editor status', async () => {
      prisma.userJourney.findUnique = jest.fn().mockReturnValueOnce(userJourney)
      prisma.userJourney.update = jest.fn().mockReturnValueOnce({
        ...userJourneyInvited,
        role: UserJourneyRole.editor
      })
      expect(
        await service.approveAccess(
          userJourneyInvited.id,
          userJourneyOwner.userId
        )
      ).toEqual({
        ...userJourneyInvited,
        role: UserJourneyRole.editor
      })
    })

    it('adds user to team', async () => {
      prisma.userJourney.findUnique = jest
        .fn()
        .mockReturnValueOnce(userJourneyInvited)

      await service.approveAccess(userJourneyInvited.id, userJourney.userId)
      expect(prisma.userTeam.upsert).toHaveBeenCalledWith({
        create: {
          teamId: 'teamId',
          userId: '2',
          role: UserTeamRole.guest
        },
        update: {},
        where: {
          teamId_userId: {
            teamId: 'teamId',
            userId: '2'
          }
        }
      })
    })
  })
})
