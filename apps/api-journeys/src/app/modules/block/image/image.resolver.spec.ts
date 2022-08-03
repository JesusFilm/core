import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import axios from 'axios'
import {
  CardBlock,
  ImageBlock,
  ImageBlockCreateInput,
  ImageBlockUpdateInput
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { JourneyService } from '../../journey/journey.service'
import { ImageBlockResolver } from './image.resolver'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

jest.mock('sharp', () => () => ({
  raw: () => ({
    ensureAlpha: () => ({
      toBuffer: () => ({
        data: new Uint8ClampedArray([]),
        info: {
          width: 640,
          height: 425
        }
      })
    })
  })
}))

jest.mock('blurhash', () => {
  return {
    encode: jest.fn(() => 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ')
  }
})

describe('ImageBlockResolver', () => {
  let resolver: ImageBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const blockCreate: ImageBlockCreateInput = {
    id: '1',
    journeyId: '2',
    parentBlockId: 'parentBlockId',
    src: 'https://unsplash.it/640/425?image=42',
    alt: 'grid image'
  }

  const createdBlock: ImageBlock = {
    id: '1',
    journeyId: '2',
    __typename: 'ImageBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 2,
    src: 'https://unsplash.it/640/425?image=42',
    alt: 'grid image',
    width: 640,
    height: 425,
    blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
  }

  const parentBlock: CardBlock = {
    id: 'parentBlockId',
    journeyId: createdBlock.journeyId,
    __typename: 'CardBlock',
    parentBlockId: '0',
    parentOrder: 0,
    coverBlockId: createdBlock.id,
    fullscreen: true
  }

  const blockUpdate: ImageBlockUpdateInput = {
    src: 'https://unsplash.it/640/425?image=42',
    alt: 'placeholder image from unsplash'
  }

  const updatedBlock: ImageBlock = {
    ...createdBlock,
    src: 'https://unsplash.it/640/425?image=42',
    alt: 'placeholder image from unsplash',
    width: 640,
    height: 425
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn((id) =>
        id === blockCreate.id ? createdBlock : parentBlock
      ),
      getAll: jest.fn(() => [createdBlock, createdBlock]),
      getSiblings: jest.fn(() => [createdBlock, createdBlock]),
      removeBlockAndChildren: jest.fn((input) => input),
      save: jest.fn((input) => createdBlock),
      update: jest.fn((id, input) => updatedBlock)
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        ImageBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
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
      expect(await blockResolver.block('1')).toEqual(createdBlock)
      expect(await blockResolver.blocks()).toEqual([createdBlock, createdBlock])
    })
  })

  describe('imageBlockCreate', () => {
    it('creates an ImageBlock', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          mockData: 'mockData' // this kinda doesnt matter since sharp returns the data we need, but still need to mock so it doesnt run the API
        }
      })

      await resolver.imageBlockCreate(blockCreate)

      expect(service.getSiblings).toHaveBeenCalledWith(
        blockCreate.journeyId,
        blockCreate.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(createdBlock)
      expect(service.update).not.toHaveBeenCalled()
    })

    it('creates a cover ImageBlock', async () => {
      await resolver.imageBlockCreate({ ...blockCreate, isCover: true })

      expect(service.save).toHaveBeenCalledWith({
        ...createdBlock,
        isCover: true,
        parentOrder: null
      })
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(
        parentBlock.coverBlockId,
        parentBlock.journeyId
      )
      expect(service.update).toHaveBeenCalledWith(parentBlock.id, {
        coverBlockId: createdBlock.id
      })
    })
  })

  describe('imageBlockUpdate', () => {
    it('updates an ImageBlock', async () => {
      expect(await resolver.imageBlockUpdate('1', '2', blockUpdate)).toEqual(
        updatedBlock
      )
    })
  })
})
