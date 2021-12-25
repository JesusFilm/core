import { Test, TestingModule } from '@nestjs/testing'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../__generated__/graphql'
import { BlockResolvers } from '../block/block.resolvers'
import { BlockService } from '../block/block.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { JourneyResolvers } from './journey.resolvers'
import { JourneyService } from './journey.service'

describe('Journey', () => {
  let resolver: JourneyResolvers,
    service: JourneyService,
    ujService: UserJourneyService
  const publishedAt = new Date('2021-11-19T12:34:56.647Z').toISOString()
  const createdAt = new Date('2021-11-19T12:34:56.647Z').toISOString()

  const journey = {
    _key: '1',
    title: 'published',
    published: true,
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

  const journeyresponse = {
    id: '1',
    title: 'published',
    published: true,
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

  const draftJourneyResponse = {
    id: '1',
    title: 'unpublished',
    published: true,
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: '2',
    slug: 'published-slug',
    createdAt,
    publishedAt,
    status: JourneyStatus.draft
  }

  const userJourney = {
    _key: '1',
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
      getBySlug: jest.fn(() => journey),
      getAllPublishedJourneys: jest.fn(() => [journey, journey]),
      getAllDraftJourneys: jest.fn(() => [
        draftJourneyResponse,
        draftJourneyResponse
      ]),
      save: jest.fn(() => journey),
      update: jest.fn(() => journey)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      forJourney: jest.fn(() => [block]),
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
        JourneyResolvers,
        journeyService,
        blockService,
        BlockResolvers,
        userJourneyService
      ]
    }).compile()
    resolver = module.get<JourneyResolvers>(JourneyResolvers)
    service = module.get<JourneyService>(JourneyService)
    ujService = module.get<UserJourneyService>(UserJourneyService)
  })

  describe('published Journey', () => {
    it('returns Journey', async () => {
      expect(await resolver.journey('1')).toEqual(journeyresponse)
      expect(await resolver.journeys(JourneyStatus.published)).toEqual([
        journeyresponse,
        journeyresponse
      ])
    })

    it('should get published journeys', async () => {
      await resolver.journeys(JourneyStatus.published)
      expect(service.getAllPublishedJourneys).toHaveBeenCalled()
    })
  })

  describe('draft Journey', () => {
    it('returns Journey', async () => {
      expect(await resolver.journeys(JourneyStatus.draft)).toEqual([
        draftJourneyResponse,
        draftJourneyResponse
      ])
    })

    it('should get draft journeys', async () => {
      await resolver.journeys(JourneyStatus.draft)
      expect(service.getAllDraftJourneys).toHaveBeenCalled()
    })
  })

  describe('Blocks', () => {
    it('returns Block', async () => {
      expect(await resolver.blocks(journeyresponse)).toEqual([blockresponse])
    })
  })

  // need working example to diagnose
  xdescribe('primaryImageBlock', () => {
    it('returns primaryImageBlock', async () => {
      expect(await resolver.primaryImageBlock(journeyresponse)).toEqual([
        blockresponse
      ])
    })
  })

  describe('createJourney', () => {
    it('creates a Journey and UserJourney', async () => {
      expect(
        await resolver.journeyCreate(journey, ownerUserJourney._key)
      ).toEqual(journeyresponse)
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
        published: true,
        publishedAt: '2021-12-07T03:22:41.135Z'
      })
    })
  })
})
