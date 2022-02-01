import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { ImageBlockCreateInput } from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import { ImageBlockResolvers } from './image.resolvers'

describe('Image', () => {
  let blockResolver: BlockResolvers,
    resolver: ImageBlockResolvers,
    service: BlockService

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'ImageBlock',
    parentBlockId: '3',
    parentOrder: 0,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }
  const blockresponse = {
    id: '1',
    journeyId: '2',
    __typename: 'ImageBlock',
    parentBlockId: '3',
    parentOrder: 0,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const input: ImageBlockCreateInput & { __typename: string } = {
    __typename: '',
    id: '1',
    parentBlockId: '2',
    journeyId: '3',
    src: 'https://blurha.sh/assets/images/img2.jpg',
    alt: 'grid image'
  }

  const inputUpdate = {
    parentBlockId: '2',
    journeyId: '3',
    src: 'https://blurha.sh/assets/images/img2.jpg',
    alt: 'grid image'
  }

  const imageblockresponse = {
    _key: input.id,
    parentBlockId: input.parentBlockId,
    parentOrder: 0,
    journeyId: input.journeyId,
    __typename: 'ImageBlock',
    src: input.src,
    alt: input.alt,
    width: 301,
    height: 193,
    blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
  }

  const imageblockupdateresponse = {
    parentBlockId: input.parentBlockId,
    journeyId: input.journeyId,
    src: input.src,
    alt: input.alt,
    width: 301,
    height: 193,
    blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
      getSiblings: jest.fn(() => []),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolvers,
        blockService,
        ImageBlockResolvers,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolvers>(BlockResolvers)
    resolver = module.get<ImageBlockResolvers>(ImageBlockResolvers)
    service = await module.resolve(BlockService)
  })

  describe('ImageBlock', () => {
    it('returns ImageBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockresponse)
      expect(await blockResolver.blocks()).toEqual([
        blockresponse,
        blockresponse
      ])
    })
  })

  describe('imageBlockCreate', () => {
    it('creates an ImageBlock', async () => {
      await resolver.imageBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(imageblockresponse)
    })
  })

  describe('imageBlockUpdate', () => {
    it('updates an ImageBlock', async () => {
      await resolver.imageBlockUpdate('1', '2', inputUpdate)
      expect(service.update).toHaveBeenCalledWith('1', imageblockupdateresponse)
    })
  })
})
