
   
import { Test, TestingModule } from '@nestjs/testing'
import { ThemeMode, ThemeName } from '../../graphql'
import { BlockResolvers } from '../block/block.resolvers'
import { BlockService } from '../block/block.service'
import { JourneyResolvers } from './journey.resolvers'
import { JourneyService } from './journey.service'

describe('Journey', () => {
  let resolver: JourneyResolvers

  const journey = {
    _key: "1",
    title: 'published',
    published: true,
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: "2",
    slug: 'published-slug'
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
    id: "1",
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
  }
  
  const journeyservice = {
    provide: JourneyService,
    useFactory: () => ({
      getBySlug: jest.fn(() =>  journey),
      getAllPublishedJourneys: jest.fn(() => [journey, journey]),
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
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('Journey', () => {
    it('returns Journey', async () => {
      expect(resolver.journey("1")).resolves.toEqual(journeyresponse)
      expect(resolver.journeys()).resolves.toEqual([journeyresponse, journeyresponse])
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
      expect(resolver.journeyUpdate(journeyupdate)).resolves.toEqual(journeyresponse)
    })
  })

  describe('publishJourney', () => {
    it('publishJourney a Journey', async () => {
      expect(resolver.journeyUpdate(journeyupdate)).resolves.toEqual(journeyresponse)
    })
  })

})
