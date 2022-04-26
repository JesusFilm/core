import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { BlockResolver } from './block.resolver'
import { BlockService } from './block.service'

describe('BlockResolver', () => {
  let resolver: BlockResolver, service: BlockService

  const image1 = {
    id: 'image1',
    journeyId: '2',
    __typename: 'ImageBlock',
    parentBlockId: 'card1',
    parentOrder: 0,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const image2 = {
    id: 'image2',
    journeyId: '2',
    __typename: 'ImageBlock',
    parentBlockId: 'card1',
    parentOrder: 1,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const image3 = {
    id: 'image3',
    journeyId: '2',
    __typename: 'ImageBlock',
    parentBlockId: 'card1',
    parentOrder: 2,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => image1),
      removeBlockAndChildren: jest.fn(() => [image1, image2, image3]),
      reorderBlock: jest.fn(() => [
        { id: 'image2', parentOrder: 0 },
        { id: 'image3', parentOrder: 1 },
        { id: 'image1', parentOrder: 2 }
      ])
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserJourneyService,
        BlockResolver,
        blockService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('blockDelete', () => {
    it('removes the block and its children', async () => {
      const data = await resolver.blockDelete('image1', '2', 'card1')

      expect(service.removeBlockAndChildren).toBeCalledTimes(1)
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(
        'image1',
        '2',
        'card1'
      )
      expect(data).toEqual([image1, image2, image3])
    })
  })

  describe('blockOrderUpdate', () => {
    it('updates the block order', async () => {
      const data = await resolver.blockOrderUpdate('image1', '2', 2)

      expect(service.reorderBlock).toHaveBeenCalledWith(
        image1.id,
        image1.journeyId,
        2
      )
      expect(data).toEqual([
        { id: 'image2', parentOrder: 0 },
        { id: 'image3', parentOrder: 1 },
        { id: 'image1', parentOrder: 2 }
      ])
    })
  })
})
