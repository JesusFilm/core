
   
import { Test, TestingModule } from '@nestjs/testing'
import { JourneyStatus, ThemeMode, ThemeName } from '../../graphql'
import { BlockResolvers } from '../block/block.resolvers'
import { BlockService } from '../block/block.service'
import { JourneyResolvers } from './journey.resolvers'
import { JourneyService } from './journey.service'

describe('Journey', () => {
  let resolver: JourneyResolvers, service: JourneyService
  const publishedAt = new Date('2021-11-19T12:34:56.647Z').toISOString()
  const createdAt = new Date('2021-11-19T12:34:56.647Z').toISOString()

  const journey = {
    _key: "1",
    title: 'published',
    published: true,
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: "2",
    slug: 'published-slug', 
    publishedAt,
    createdAt,    
  }

  const block = {
    _key: "2",
    journeyId: "1",
    type: 'ImageBlock',
    parentBlockId: "3",
    parentOrder: 2,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const blockresponse = {
    id: "2",
    journeyId: "1",
    type: 'ImageBlock',
    parentBlockId: "3",
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
    slug: 'published-slug',
  }

  const journeyresponse = {
    id: "1",
    title: 'published',
    published: true,
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: "2",
    slug: 'published-slug',
    createdAt,
    publishedAt,
    status: JourneyStatus.published
  }

  const draftJourneyResponse = {
    id: "1",
    title: 'unpublished',
    published: true,
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: "2",
    slug: 'published-slug',
    createdAt,
    publishedAt,
    status: JourneyStatus.draft
  }
  
  const journeyservice = {
    provide: JourneyService,
    useFactory: () => ({
      getBySlug: jest.fn(() =>  journey),
      getAllPublishedJourneys: jest.fn(() => [journey, journey]),
      getAllDraftJourneys: jest.fn(() => [draftJourneyResponse, draftJourneyResponse]),
      save: jest.fn(() => journey),
      update: jest.fn(() => journey)
    })
  }
  const blockservice = {
    provide: BlockService,
    useFactory: () => ({
      forJourney: jest.fn(() =>  [block]),
      get: jest.fn(() => block)
    })
  }
 
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyResolvers, journeyservice, blockservice, BlockResolvers]
    }).compile()
    resolver = module.get<JourneyResolvers>(JourneyResolvers)
    service = module.get<JourneyService>(JourneyService)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('published Journey', () => {
    it('returns Journey', async () => {
      expect(resolver.journey("1")).resolves.toEqual(journeyresponse)
      expect(resolver.journeys(JourneyStatus.published)).resolves.toEqual([journeyresponse, journeyresponse])
    })

    it('should get published journeys', async () => {
      await resolver.journeys(JourneyStatus.published)
      expect(service.getAllPublishedJourneys).toHaveBeenCalled()
    })
  })

  
  describe('draft Journey', () => {
    it('returns Journey', async () => {
      expect(resolver.journeys(JourneyStatus.draft)).resolves.toEqual([draftJourneyResponse, draftJourneyResponse])
    })

    it('should get draft journeys', async () => {
      await resolver.journeys(JourneyStatus.draft)
      expect(service.getAllDraftJourneys).toHaveBeenCalled()
    })
  })

  describe('Blocks', () => {
    it('returns Block', async () => {
      expect(resolver.blocks(journeyresponse)).resolves.toEqual([blockresponse])
    })
  })

  // need working example to diagnose
  xdescribe('primaryImageBlock', () => {
    it('returns primaryImageBlock', async () => {
      expect(resolver.primaryImageBlock(journeyresponse)).resolves.toEqual([blockresponse])
    })
  })

  describe('createJourney', () => {
    it('creates a Journey', async () => {
      expect(resolver.createJourney(journey)).resolves.toEqual(journeyresponse)
    })
  })

  describe('updateJourney', () => {
    it('updates a Journey', async () => {
      resolver.journeyUpdate("1", journeyupdate)
      expect(service.update).toHaveBeenCalledWith("1", journeyupdate)
    })
  })

  describe('publishJourney', () => {
    it('publishJourney a Journey', async () => {
      const date = '2021-12-07T03:22:41.135Z'
      jest.useFakeTimers().setSystemTime(new Date(date).getTime())
      resolver.journeyPublish("1")      
      expect(service.update).toHaveBeenCalledWith("1", { publishedAt: '2021-12-07T03:22:41.135Z'})
    })
  })

})
