import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { v4 as uuidv4 } from 'uuid'
import {
  mockCollectionRemoveResult,
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database/mock'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import {
  IdType,
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { PrismaService } from '../../lib/prisma.service'
import { UserJourneyRecord, UserJourneyService } from './userJourney.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('UserJourneyService', () => {
  let service: UserJourneyService,
    prismaService: PrismaService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn((id) => (id === journey.id ? journey : null)),
      getBySlug: jest.fn((slug) => (slug === journey.slug ? journey : null))
    })
  }

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserJourneyService,
        journeyService,
        PrismaService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<UserJourneyService>(UserJourneyService)
    collectionMock = mockDeep()
    service.collection = collectionMock
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.userTeam.upsert = jest.fn()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const userJourney: UserJourneyRecord = {
    id: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.editor
  }

  const userJourneyWithId = keyAsId(userJourney)

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
    beforeEach(() => {
      db.query.mockReturnValue(
        mockDbQueryResult(service.db, [userJourney, userJourney])
      )
    })

    it('should return an array of userjourneys', async () => {
      expect(await service.forJourney(journey)).toEqual([
        userJourneyWithId,
        userJourneyWithId
      ])
    })
  })

  describe('forUserJourney', () => {
    beforeEach(() => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [userJourney]))
    })

    it('should return a userjourney', async () => {
      expect(await service.forJourneyUser('1', '2')).toEqual(userJourneyWithId)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      collectionMock.remove.mockReturnValue(
        mockCollectionRemoveResult(service.collection, {
          ...userJourney,
          _key: userJourney.id
        })
      )
    })

    it('should return a removed userJourney', async () => {
      expect(await service.remove('1')).toEqual(userJourneyWithId)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      collectionMock.save.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...userJourney,
          _key: userJourney.id
        })
      )
    })

    it('should return a saved userJourney', async () => {
      expect(await service.save(userJourney)).toEqual(userJourneyWithId)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      collectionMock.update.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...userJourney,
          _key: userJourney.id
        })
      )
    })

    it('should return an updated userJourney', async () => {
      expect(await service.update('1', userJourney)).toEqual(userJourneyWithId)
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
      db.query.mockReturnValueOnce(mockDbQueryResult(service.db, []))
      mockUuidv4.mockReturnValueOnce(userJourneyInvited.id)
      collectionMock.save.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...userJourneyInvited,
          _key: userJourneyInvited.id
        })
      )

      expect(
        await service.requestAccess(journey.id, IdType.databaseId, '1')
      ).toEqual(userJourneyInvited)
    })
    it('creates a UserJourney when journeyId is slug', async () => {
      db.query.mockReturnValueOnce(mockDbQueryResult(service.db, []))
      mockUuidv4.mockReturnValueOnce(userJourneyInvited.id)
      collectionMock.save.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...userJourneyInvited,
          _key: userJourneyInvited.id
        })
      )

      expect(
        await service.requestAccess(journey.slug, IdType.slug, '1')
      ).toEqual(userJourneyInvited)
    })

    it('returns an existing a UserJourney access request ', async () => {
      db.query.mockReturnValueOnce(
        mockDbQueryResult(service.db, [userJourneyInvited])
      )

      expect(
        await service.requestAccess(journey.id, IdType.databaseId, '1')
      ).toEqual(userJourneyInvited)
    })

    it('returns undefined if UserJourney role access already granted', async () => {
      db.query.mockReturnValueOnce(mockDbQueryResult(service.db, [userJourney]))

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
      db.query.mockReturnValueOnce(mockDbQueryResult(service.db, []))

      await service.approveAccess('wrongId', '1').catch((error) => {
        expect(error.message).toEqual('userJourney does not exist')
      })
    })

    it('should throw Auth error if approver an invitee', async () => {
      db.query.mockReturnValueOnce(
        mockDbQueryResult(service.db, [userJourneyInvited])
      )
      db.query.mockReturnValueOnce(
        mockDbQueryResult(service.db, [userJourneyInvited])
      )

      await service
        .approveAccess(userJourneyInvited.id, userJourneyInvited.userId)
        .catch((error) => {
          expect(error.message).toEqual(
            'You do not have permission to approve access'
          )
        })
    })

    it('updates a UserJourney to editor status', async () => {
      db.query.mockReturnValueOnce(
        mockDbQueryResult(service.db, [userJourneyInvited])
      )
      db.query.mockReturnValueOnce(
        mockDbQueryResult(service.db, [userJourneyOwner])
      )
      collectionMock.update.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...userJourneyInvited,
          role: UserJourneyRole.editor,
          _key: userJourneyInvited.id
        })
      )

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
      db.query.mockReturnValueOnce(
        mockDbQueryResult(service.db, [userJourneyInvited])
      )
      db.query.mockReturnValueOnce(
        mockDbQueryResult(service.db, [userJourneyOwner])
      )
      collectionMock.update.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...userJourneyInvited,
          role: UserJourneyRole.editor,
          _key: userJourneyInvited.id
        })
      )

      await service.approveAccess(userJourneyInvited.id, userJourney.userId)
      expect(prismaService.userTeam.upsert).toHaveBeenCalledWith({
        create: {
          teamId: 'teamId',
          userId: '2',
          role: 'guest'
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
