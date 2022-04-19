import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import { ImageBlockCreateInput } from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { ImageBlockResolver } from './image.resolver'

describe('ImageBlockResolver', () => {
  let resolver: ImageBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const block = {
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
    alt: 'grid image',
    blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
  }

  const inputUpdate = {
    parentBlockId: '2',
    journeyId: '3',
    src: 'https://blurha.sh/assets/images/img2.jpg',
    alt: 'grid image'
  }

  const inputWithId = {
    id: input.id,
    parentBlockId: input.parentBlockId,
    parentOrder: 2,
    journeyId: input.journeyId,
    __typename: 'ImageBlock',
    src: input.src,
    alt: input.alt,
    width: 301,
    height: 193,
    blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
  }

  const imageBlockUpdateResponse = {
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
      getSiblings: jest.fn(() => [block, block]),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        ImageBlockResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<ImageBlockResolver>(ImageBlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('ImageBlock', () => {
    it('returns ImageBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('imageBlockCreate', () => {
    it('creates an ImageBlock', async () => {
      await resolver.imageBlockCreate(input)
      expect(service.getSiblings).toHaveBeenCalledWith(
        input.journeyId,
        input.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(inputWithId)
    })
    it('creates a cover ImageBlock', async () => {
      await resolver.imageBlockCreate({ ...input, isCover: true })

      expect(service.save).toHaveBeenCalledWith({
        ...inputWithId,
        isCover: true,
        parentOrder: null
      })
    })
  })

  describe('imageBlockUpdate', () => {
    it('updates an ImageBlock', async () => {
      await resolver.imageBlockUpdate('1', '2', inputUpdate)
      expect(service.update).toHaveBeenCalledWith('1', imageBlockUpdateResponse)
    })
  })
})
