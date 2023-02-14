import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import fetch, { Response } from 'node-fetch'
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
import { MemberService } from '../../member/member.service'
import { ImageBlockResolver } from './image.resolver'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

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

  const blockCreateForDeletedCover: ImageBlockCreateInput = {
    ...blockCreate,
    parentBlockId: 'parentBlockWithDeletedCoverId'
  }

  const createdBlockForDeletedCover: ImageBlock = {
    ...createdBlock,
    parentBlockId: 'parentBlockWithDeletedCoverId'
  }

  const parentBlockWithDeletedCover: CardBlock = {
    ...parentBlock,
    id: 'parentBlockWithDeletedCoverId',
    coverBlockId: 'nonExistentBlock'
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
      get: jest.fn((id) => {
        switch (id) {
          case blockCreate.id: {
            return createdBlock
          }
          case parentBlock.id: {
            return parentBlock
          }
          case parentBlockWithDeletedCover.id: {
            return parentBlockWithDeletedCover
          }
          default: {
            return undefined
          }
        }
      }),
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
        MemberService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<ImageBlockResolver>(ImageBlockResolver)
    service = await module.resolve(BlockService)

    // this kinda doesnt matter since sharp returns the data we need, but still need to mock so it doesnt run the API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      buffer: async () =>
        await Promise.resolve({
          items: []
        })
    } as unknown as Response)
  })

  describe('ImageBlock', () => {
    it('returns ImageBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(createdBlock)
      expect(await blockResolver.blocks()).toEqual([createdBlock, createdBlock])
    })
  })

  describe('imageBlockCreate', () => {
    it('creates an ImageBlock', async () => {
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

    it('checks of cover image block needs to be deleted before creating new coverImage block', async () => {
      await resolver.imageBlockCreate({
        ...blockCreateForDeletedCover,
        isCover: true
      })

      expect(service.save).toHaveBeenCalledWith({
        ...createdBlockForDeletedCover,
        isCover: true,
        parentOrder: null
      })
      expect(service.removeBlockAndChildren).not.toHaveBeenCalled()
      expect(service.update).toHaveBeenCalledWith(
        parentBlockWithDeletedCover.id,
        {
          coverBlockId: createdBlockForDeletedCover.id
        }
      )
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
