import { Test, TestingModule } from '@nestjs/testing'
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

describe('JourneyResolver', () => {
  let resolver: JourneyResolver,
    service: JourneyService,
    ujService: UserJourneyService
  const publishedAt = new Date('2021-11-19T12:34:56.647Z').toISOString()
  const createdAt = new Date('2021-11-19T12:34:56.647Z').toISOString()

  const journey = {
    _key: '1',
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
    _key: '2',
    journeyId: '1',
    __typename: 'ImageBlock',
    parentBlockId: '3',
    parentOrder: 2,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const blockresponse = {
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

  const journeyupdate = {
    title: 'published',
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug'
  }

  const journeyResponse = {
    id: '1',
    title: 'published',
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: '2',
    slug: 'published-slug',
    createdAt,
    publishedAt,
    status: JourneyStatus.published
  }

  const pijourneyResponse = {
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

  const pijourneyResponsenull = {
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
    _key: '1',
    userId: '1',
    journeyId: '1',
    role: UserJourneyRole.editor
  }

  const userJourneyResponse = {
    id: '1',
    userId: '1',
    journeyId: '1',
    role: UserJourneyRole.editor
  }

  const ownerUserJourney = {
    _key: '2',
    userId: '2',
    journeyId: '1',
    role: UserJourneyRole.owner
  }

  const invitedUserJourney = {
    _key: '3',
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
      save: jest.fn(() => journey),
      update: jest.fn(() => journey)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      forJourney: jest.fn(() => [block]),
      getSiblings: jest.fn(() => [block]),
      get: jest.fn(() => block),
      save: jest.fn((input) => input)
    })
  }

  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({
      get: jest.fn((key) => {
        if (key === ownerUserJourney._key) return ownerUserJourney
        if (key === invitedUserJourney._key) return invitedUserJourney
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
        userJourneyResponse.journeyId,
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
      expect(await resolver.blocks(journeyResponse)).toEqual([blockresponse])
    })
  })

  // need working example to diagnose
  describe('primaryImageBlock', () => {
    it('returns primaryImageBlock', async () => {
      expect(await resolver.primaryImageBlock(pijourneyResponse)).toEqual(
        blockresponse
      )
    })
    it('should return null', async () => {
      expect(await resolver.primaryImageBlock(pijourneyResponsenull)).toEqual(
        null
      )
    })
  })

  describe('createJourney', () => {
    it('creates a Journey and UserJourney', async () => {
      expect(
        await resolver.journeyCreate(journey, ownerUserJourney._key)
      ).toEqual(journeyResponse)
      expect(ujService.save).toHaveBeenCalledWith({
        userId: ownerUserJourney._key,
        journeyId: journey._key,
        role: UserJourneyRole.owner
      })
    })
  })

  describe('updateJourney', () => {
    it('updates a Journey', async () => {
      await resolver
        .journeyUpdate('1', journeyupdate)
        .catch((err) => console.log(err))
      expect(service.update).toHaveBeenCalledWith('1', journeyupdate)
    })
    it('updates a Journey 2', async () => {
      await resolver
        .journeyUpdate('1', journeyupdate)
        .catch((err) => console.log(err))
      expect(service.update).toHaveBeenCalledWith('1', journeyupdate)
    })
  })

  describe('publishJourney', () => {
    it('publishes a Journey', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      await resolver.journeyPublish('1').catch((err) => console.log(err))
      expect(service.update).toHaveBeenCalledWith('1', {
        status: JourneyStatus.published,
        publishedAt: '2021-12-07T03:22:41.135Z'
      })
    })
  })

  describe('userJourneys', () => {
    it('should get userJourneys', async () => {
      expect(await resolver.userJourneys(journeyResponse)).toEqual([
        userJourneyResponse,
        userJourneyResponse
      ])
      expect(ujService.forJourney).toHaveBeenCalledWith(journeyResponse)
    })
  })
})
