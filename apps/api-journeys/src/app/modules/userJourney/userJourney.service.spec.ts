import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { UserJourney } from '.prisma/api-journeys-client'

import {
  IdType,
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'
import { MemberService } from '../member/member.service'
import { UserJourneyService } from './userJourney.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('UserJourneyService', () => {
  let service: UserJourneyService,
    mService: MemberService,
    prisma: PrismaService

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn((id) => (id === journey.id ? journey : null)),
      getBySlug: jest.fn((slug) => (slug === journey.slug ? journey : null))
    })
  }

  const memberService = {
    provide: MemberService,
    useFactory: () => ({
      save: jest.fn((member) => member),
      getMemberByTeamId: jest.fn((userId, teamId) => {
        'memberId'
      })
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserJourneyService,
        journeyService,
        memberService,
        PrismaService
      ]
    }).compile()

    service = module.get<UserJourneyService>(UserJourneyService)
    mService = module.get<MemberService>(MemberService)
    prisma = module.get<PrismaService>(PrismaService)
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const userJourney: UserJourney = {
    id: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.editor,
    openedAt: new Date()
  }

  const userJourneyInvited = {
    id: '2',
    userId: '2',
    journeyId: '1',
    role: UserJourneyRole.inviteRequested
  }

  const journey: Journey & { teamId: string } = {
    id: '1',
    title: 'published',
    language: { id: '529' },
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlock: null,
    slug: 'published-slug',
    createdAt: '',
    status: JourneyStatus.published,
    teamId: 'teamId'
  }

  describe('forJourney', () => {
    it('should return an array of userjourneys', async () => {
      prisma.userJourney.findMany = jest
        .fn()
        .mockResolvedValueOnce([userJourney, userJourney])
      expect(await service.forJourney(journey)).toEqual([
        userJourney,
        userJourney
      ])
    })
  })

  describe('forUserJourney', () => {
    it('should return a userjourney', async () => {
      prisma.userJourney.findUnique = jest
        .fn()
        .mockResolvedValueOnce(userJourney)
      expect(await service.forJourneyUser('1', '2')).toEqual(userJourney)
      expect(prisma.userJourney.findUnique).toHaveBeenCalledWith({
        where: { journeyId_userId: { userId: '2', journeyId: '1' } }
      })
    })
  })

  describe('remove', () => {
    it('should return a removed userJourney', async () => {
      prisma.userJourney.delete = jest.fn().mockResolvedValueOnce(userJourney)
      await service.remove('1')
      expect(prisma.userJourney.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      })
    })
  })

  describe('update', () => {
    it('should return an updated userJourney', async () => {
      prisma.userJourney.update = jest.fn().mockResolvedValueOnce(userJourney)
      expect(await service.update('1', userJourney)).toEqual(userJourney)
      expect(prisma.userJourney.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: userJourney
      })
    })
  })

  describe('requestAccess', () => {
    it('throws UserInputError when journey does not exist', async () => {
      await service
        .requestAccess('randomJourneyId', IdType.databaseId, '1')
        .catch((error) => {
          expect(error.message).toEqual('journey does not exist')
        })
    })

    it('creates a UserJourney when journeyId is databaseId', async () => {
      mockUuidv4.mockReturnValueOnce(userJourneyInvited.id)
      prisma.userJourney.findUnique = jest
        .fn()
        .mockResolvedValueOnce(userJourneyInvited)
      prisma.userJourney.create = jest
        .fn()
        .mockReturnValueOnce(userJourneyInvited)
      expect(
        await service.requestAccess(journey.id, IdType.databaseId, '1')
      ).toEqual(userJourneyInvited)
    })
    it('creates a UserJourney when journeyId is slug', async () => {
      mockUuidv4.mockReturnValueOnce(userJourneyInvited.id)
      service.forJourneyUser = jest.fn().mockReturnValueOnce(null)
      prisma.userJourney.create = jest
        .fn()
        .mockReturnValueOnce(userJourneyInvited)
      expect(
        await service.requestAccess(journey.slug, IdType.slug, '1')
      ).toEqual(userJourneyInvited)
    })

    it('returns an existing a UserJourney access request ', async () => {
      service.forJourneyUser = jest.fn().mockReturnValueOnce(userJourneyInvited)
      expect(
        await service.requestAccess(journey.id, IdType.databaseId, '1')
      ).toEqual(userJourneyInvited)
    })

    it('returns undefined if UserJourney role access already granted', async () => {
      service.forJourneyUser = jest.fn().mockReturnValueOnce(userJourney)
      expect(
        await service.requestAccess(journey.id, IdType.databaseId, '1')
      ).toEqual(undefined)
    })
  })

  describe('approveAccess', () => {
    const userJourneyOwner = {
      ...userJourney,
      role: UserJourneyRole.owner
    }

    it('should throw UserInputError if userJourney does not exist', async () => {
      service.get = jest.fn().mockReturnValueOnce(null)
      await service.approveAccess('wrongId', '1').catch((error) => {
        expect(error.message).toEqual('userJourney does not exist')
      })
    })

    it('should throw Auth error if approver an invitee', async () => {
      service.get = jest.fn().mockReturnValueOnce(userJourneyInvited)
      prisma.userJourney.findUnique = jest
        .fn()
        .mockReturnValueOnce(userJourneyInvited)
      await service
        .approveAccess(userJourneyInvited.id, userJourneyInvited.userId)
        .catch((error) => {
          expect(error.message).toEqual(
            'You do not have permission to approve access'
          )
        })
    })

    it('updates a UserJourney to editor status', async () => {
      service.get = jest.fn().mockReturnValueOnce(userJourneyInvited)
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
      service.get = jest.fn().mockReturnValueOnce(userJourneyInvited)
      prisma.userJourney.findUnique = jest.fn().mockReturnValueOnce(userJourney)
      prisma.userJourney.update = jest
        .fn()
        .mockReturnValueOnce(userJourneyInvited)
      await service.approveAccess(userJourney.id, userJourney.userId)
      expect(mService.save).toHaveBeenCalledWith(
        {
          id: '1:teamId',
          teamId: 'teamId',
          userId: '1'
        },
        { overwriteMode: 'ignore' }
      )
    })
  })
})
