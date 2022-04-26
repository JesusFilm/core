import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import {
  IdType,
  Journey,
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

  const journey: Journey = {
    id: 'journeyId',
    slug: 'journey-slug',
    title: 'published',
    status: JourneyStatus.published,
    language: { id: '529' },
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlock: null,
    publishedAt,
    createdAt
  }

  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    __typename: 'ImageBlock',
    parentBlockId: null,
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

  const userJourney = {
    id: 'userJourneyId',
    userId: 'userId',
    journeyId: 'journeyId',
    role: UserJourneyRole.editor
  }

  const invitedUserJourney = {
    id: 'invitedUserJourneyId',
    userId: 'invitedUserId',
    journeyId: 'journeyId',
    role: UserJourneyRole.inviteRequested
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn((id) => (id === journey.id ? journey : null)),
      getBySlug: jest.fn((slug) => (slug === journey.slug ? journey : null)),
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
      get: jest.fn(() => block)
    })
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

  describe('adminJourneys', () => {
    it('should get published journeys', async () => {
      expect(await resolver.adminJourneys('userId')).toEqual([journey, journey])
      expect(service.getAllByOwnerEditor).toHaveBeenCalledWith('userId')
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
      expect(
        await resolver.adminJourney('userId', 'journeyId', IdType.databaseId)
      ).toEqual(journey)
      expect(service.get).toHaveBeenCalledWith('journeyId')
      expect(ujService.forJourneyUser).toHaveBeenCalledWith(
        userJourney.journeyId,
        userJourney.userId
      )
    })

    it('returns null if no journey found', async () => {
      expect(
        await resolver.adminJourney('userId', '404', IdType.databaseId)
      ).toEqual(null)
      expect(service.get).toHaveBeenCalledWith('404')
    })

    it('throws error if user is unknown', async () => {
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
      expect(service.get).toHaveBeenCalledWith('journeyId')
    })

    it('throws error if user is invited', async () => {
      await expect(
        async () =>
          await resolver.adminJourney(
            'invitedUserId',
            'journeyId',
            IdType.databaseId
          )
      ).rejects.toThrow('User invitation pending.')
      expect(service.get).toHaveBeenCalledWith('journeyId')
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
      expect(await resolver.journey('journeyId', IdType.databaseId)).toEqual(
        journey
      )
      expect(service.get).toHaveBeenCalledWith('journeyId')
    })

    it('returns null if no journey found', async () => {
      expect(await resolver.journey('404', IdType.databaseId)).toEqual(null)
      expect(service.get).toHaveBeenCalledWith('404')
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
  })

  describe('journeyCreate', () => {
    it('creates a Journey', async () => {
      mockUuidv4.mockReturnValueOnce('journeyId')
      expect(
        await resolver.journeyCreate(
          { title: 'Untitled Journey', languageId: '529' },
          'userId'
        )
      ).toEqual({
        id: 'journeyId',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        createdAt: new Date().toISOString(),
        languageId: '529',
        status: JourneyStatus.draft,
        slug: 'untitled-journey',
        title: 'Untitled Journey'
      })
    })

    it('creates a UserJourney', async () => {
      mockUuidv4.mockReturnValueOnce('journeyId')
      await resolver.journeyCreate(
        { title: 'Untitled Journey', languageId: '529' },
        'userId'
      )
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
        await resolver.journeyCreate(
          { title: 'Untitled Journey', languageId: '529' },
          'userId'
        )
      ).toEqual({
        id: 'journeyId',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        createdAt: new Date().toISOString(),
        languageId: '529',
        status: JourneyStatus.draft,
        slug: 'untitled-journey-journeyId',
        title: 'Untitled Journey'
      })
    })

    it('throws error and does not get stuck in retry loop', async () => {
      const mockSave = service.save as jest.MockedFunction<typeof service.save>
      mockSave.mockRejectedValueOnce(new Error('database error'))
      await expect(
        resolver.journeyCreate(
          { title: 'Untitled Journey', languageId: '529' },
          'userId'
        )
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
      expect(await resolver.userJourneys(journey)).toEqual([
        userJourney,
        userJourney
      ])
      expect(ujService.forJourney).toHaveBeenCalledWith(journey)
    })
  })

  describe('status', () => {
    it('should return draft', async () => {
      expect(resolver.status({ ...journey, publishedAt: null })).toEqual(
        JourneyStatus.draft
      )
    })

    it('should return published', async () => {
      expect(resolver.status(journey)).toEqual(JourneyStatus.published)
    })
  })

  describe('language', () => {
    it('returns object for federation', async () => {
      expect(await resolver.language({ languageId: 'languageId' })).toEqual({
        __typename: 'Language',
        id: 'languageId'
      })
    })
  })

  it('when no languageId returns object for federation with default', async () => {
    expect(await resolver.language({})).toEqual({
      __typename: 'Language',
      id: '529'
    })
  })
})
