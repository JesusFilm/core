import { Test, TestingModule } from '@nestjs/testing'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserRoleService } from '../userRole/userRole.service'
import { PrismaService } from '../../lib/prisma.service'
import { BlockResolver } from './block.resolver'
import { BlockService } from './block.service'

describe('BlockResolver', () => {
  let resolver: BlockResolver,
    service: BlockService,
    prismaService: PrismaService

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
    PrismaService,
    useFactory: () => ({
      duplicateBlock: jest.fn(() => [image1, image1, image2, image3]),
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
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
    prismaService = await module.resolve(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(image1)
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

  describe('blockDuplicate', () => {
    it('duplicates the block and its children', async () => {
      const data = await resolver.blockDuplicate('image1', '2', 1)

      expect(service.duplicateBlock).toBeCalledTimes(1)
      expect(service.duplicateBlock).toHaveBeenCalledWith('image1', '2', 1)
      expect(data).toEqual([image1, image1, image2, image3])
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
