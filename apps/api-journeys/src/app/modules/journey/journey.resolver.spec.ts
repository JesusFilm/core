import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import {
  IdType,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../__generated__/graphql'
import { BlockResolver } from '../block/block.resolver'
import { BlockService } from '../block/block.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { JourneyResolver } from './journey.resolver'
import { JourneyService } from './journey.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

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
    ujService: UserJourneyService
  const publishedAt = new Date('2021-11-19T12:34:56.647Z').toISOString()
  const createdAt = new Date('2021-11-19T12:34:56.647Z').toISOString()

  const journey = {
    id: '1',
    title: 'published',
    status: JourneyStatus.published,
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: '2',
    slug: 'published-slug',
    publishedAt,
    createdAt
  }

  const block = {
    id: '2',
    journeyId: '1',
    __typename: 'ImageBlock',
    parentBlockId: '3',
    parentOrder: 2,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const journeyUpdate = {
    title: 'published',
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug'
  }

  const journeyResponse = {
    ...journey,
    status: JourneyStatus.published
  }

  const piJourneyResponse = {
    id: '1',
    title: 'published',
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlock: {
      id: '2',
      src: '',
      width: 1,
      height: 1,
      alt: '',
      blurhash: '',
      journeyId: '1',
      parentOrder: 0
    },
    slug: 'published-slug',
    createdAt,
    publishedAt,
    status: JourneyStatus.published
  }

  const piJourneyResponsenull = {
    id: '1',
    title: 'published',
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlock: null,
    slug: 'published-slug',
    createdAt,
    publishedAt,
    status: JourneyStatus.published
  }

  const userJourney = {
    id: '1',
    userId: '1',
    journeyId: '1',
    role: UserJourneyRole.editor
  }

  const ownerUserJourney = {
    id: '2',
    userId: '2',
    journeyId: '1',
    role: UserJourneyRole.owner
  }

  const invitedUserJourney = {
    id: '3',
    userId: '3',
    journeyId: '1',
    role: UserJourneyRole.inviteRequested
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn(() => journey),
      getBySlug: jest.fn(() => journey),
      getAllPublishedJourneys: jest.fn(() => [journey, journey]),
      getAllByOwnerEditor: jest.fn(() => [journey, journey]),
      save: jest.fn((input) => input),
      update: jest.fn(() => journey)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      forJourney: jest.fn(() => [block]),
      getSiblings: jest.fn(() => [block]),
      get: jest.fn(() => block),
      save: jest.fn((input) => ({
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        createdAt,
        locale: 'en-US',
        status: JourneyStatus.draft,
        ...input
      }))
    })
  }

  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({
      get: jest.fn((key) => {
        if (key === ownerUserJourney.id) return ownerUserJourney
        if (key === invitedUserJourney.id) return invitedUserJourney
        return userJourney
      }),
      save: jest.fn((input) => input),
      forJourney: jest.fn(() => [userJourney, userJourney]),
      forJourneyUser: jest.fn((journeyId, userId) => {
        if (userId === ownerUserJourney.userId) return ownerUserJourney
        if (userId === invitedUserJourney.userId) return invitedUserJourney
        return userJourney
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
        userJourneyService
      ]
    }).compile()
    resolver = module.get<JourneyResolver>(JourneyResolver)
    service = module.get<JourneyService>(JourneyService)
    ujService = module.get<UserJourneyService>(UserJourneyService)
  })

  describe('adminJourney', () => {
    it('returns Journey', async () => {
      expect(await resolver.adminJourney('2', 'slug')).toEqual(journeyResponse)
      expect(service.getBySlug).toHaveBeenCalledWith('slug')
      expect(ujService.forJourneyUser).toHaveBeenCalledWith(
        userJourney.journeyId,
        '2'
      )
    })

    it('returns Journey by id', async () => {
      expect(await resolver.adminJourney('2', '1', IdType.databaseId)).toEqual(
        journeyResponse
      )
      expect(service.get).toHaveBeenCalledWith('1')
    })
  })

  describe('journey', () => {
    it('returns Journey', async () => {
      expect(await resolver.journey('slug')).toEqual(journeyResponse)
      expect(service.getBySlug).toHaveBeenCalledWith('slug')
    })

    it('returns Journey by id', async () => {
      expect(await resolver.journey('1', IdType.databaseId)).toEqual(
        journeyResponse
      )
      expect(service.get).toHaveBeenCalledWith('1')
    })
  })

  describe('adminJourneys', () => {
    it('should get published journeys', async () => {
      expect(await resolver.adminJourneys('1')).toEqual([
        journeyResponse,
        journeyResponse
      ])
      expect(service.getAllByOwnerEditor).toHaveBeenCalledWith('1')
    })
  })

  describe('journeys', () => {
    it('should get published journeys', async () => {
      expect(await resolver.journeys()).toEqual([
        journeyResponse,
        journeyResponse
      ])
      expect(service.getAllPublishedJourneys).toHaveBeenCalled()
    })
  })

  describe('Blocks', () => {
    it('returns Block', async () => {
      expect(await resolver.blocks(journeyResponse)).toEqual([block])
    })
  })

  // need working example to diagnose
  describe('primaryImageBlock', () => {
    it('returns primaryImageBlock', async () => {
      expect(await resolver.primaryImageBlock(piJourneyResponse)).toEqual(block)
    })
    it('should return null', async () => {
      expect(await resolver.primaryImageBlock(piJourneyResponsenull)).toEqual(
        null
      )
    })
  })

  describe('journeyCreate', () => {
    it('creates a Journey', async () => {
      mockUuidv4.mockReturnValueOnce('journeyId')
      expect(
        await resolver.journeyCreate({ title: 'Untitled Journey' }, 'userId')
      ).toEqual({
        id: 'journeyId',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        createdAt: new Date().toISOString(),
        locale: 'en-US',
        status: JourneyStatus.draft,
        slug: 'untitled-journey',
        title: 'Untitled Journey'
      })
    })

    it('creates a UserJourney', async () => {
      mockUuidv4.mockReturnValueOnce('journeyId')
      await resolver.journeyCreate({ title: 'Untitled Journey' }, 'userId')
      expect(ujService.save).toHaveBeenCalledWith({
        userId: 'userId',
        journeyId: 'journeyId',
        role: UserJourneyRole.owner
      })
    })

    it('adds uuid if slug already taken', async () => {
      const mockSave = service.save as jest.MockedFunction<typeof service.save>
      mockSave.mockRejectedValueOnce({ errorNum: 1210 })
      mockUuidv4.mockReturnValueOnce('journeyId')
      expect(
        await resolver.journeyCreate({ title: 'Untitled Journey' }, 'userId')
      ).toEqual({
        id: 'journeyId',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        createdAt: new Date().toISOString(),
        locale: 'en-US',
        status: JourneyStatus.draft,
        slug: 'untitled-journey-journeyId',
        title: 'Untitled Journey'
      })
    })

    it('throws error and does not get stuck in retry loop', async () => {
      const mockSave = service.save as jest.MockedFunction<typeof service.save>
      mockSave.mockRejectedValueOnce(new Error('database error'))
      await expect(
        resolver.journeyCreate({ title: 'Untitled Journey' }, 'userId')
      ).rejects.toThrow('database error')
    })
  })

  describe('journeyUpdate', () => {
    it('updates a Journey', async () => {
      await resolver.journeyUpdate('1', journeyUpdate)
      expect(service.update).toHaveBeenCalledWith('1', journeyUpdate)
    })
    it('updates a Journey 2', async () => {
      await resolver.journeyUpdate('1', journeyUpdate)
      expect(service.update).toHaveBeenCalledWith('1', journeyUpdate)
    })

    it('throws UserInputErrror', async () => {
      const mockUpdate = service.update as jest.MockedFunction<
        typeof service.update
      >
      mockUpdate.mockRejectedValueOnce({ errorNum: 1210 })
      await expect(
        resolver.journeyUpdate('journeyId', { slug: 'untitled-journey' })
      ).rejects.toThrow('Slug is not unique')
    })

    it('throws error gracefully', async () => {
      const mockUpdate = service.update as jest.MockedFunction<
        typeof service.update
      >
      mockUpdate.mockRejectedValueOnce(new Error('database error'))
      await expect(
        resolver.journeyUpdate('journeyId', { title: 'Untitled Journey' })
      ).rejects.toThrow('database error')
    })
  })

  describe('journeyPublish', () => {
    it('publishes a Journey', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      await resolver.journeyPublish('1')
      expect(service.update).toHaveBeenCalledWith('1', {
        status: JourneyStatus.published,
        publishedAt: '2021-12-07T03:22:41.135Z'
      })
    })
  })

  describe('userJourneys', () => {
    it('should get userJourneys', async () => {
      expect(await resolver.userJourneys(journeyResponse)).toEqual([
        userJourney,
        userJourney
      ])
      expect(ujService.forJourney).toHaveBeenCalledWith(journeyResponse)
    })
  })
})
