import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
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
      getSiblings: jest.fn(() => [image1, image2, image3]),
      update: jest.fn((input) => input)
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

  describe('blockOrderUpdate', () => {
    it('updates the block order', async () => {
      await resolver.blockOrderUpdate('image1', '2', 2)
      expect(service.update).toBeCalledTimes(3)
      expect(service.update).toHaveBeenCalledWith('image2', {
        parentOrder: 0
      })
      expect(service.update).toHaveBeenCalledWith('image3', {
        parentOrder: 1
      })
      expect(service.update).toHaveBeenCalledWith('image1', {
        parentOrder: 2
      })
    })

    it('does not update if block not part of current journey', async () => {
      const data = await resolver.blockOrderUpdate('image1', '1', 2)

      expect(service.update).toBeCalledTimes(0)
      expect(data).toEqual([])
    })

    it('does not update if block does not have parent order', async () => {
      const coverImage1 = { ...image1, parentOrder: undefined }
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => coverImage1),
          getSiblings: jest.fn(() => [coverImage1, image2, image3]),
          update: jest.fn((input) => input)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [
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

      const data = await resolver.blockOrderUpdate('image1', '1', 2)

      expect(service.update).toBeCalledTimes(0)
      expect(data).toEqual([])
    })
  })
})
