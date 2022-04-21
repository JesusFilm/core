import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import {
  CardBlock,
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { VideoBlockResolver } from './video.resolver'

describe('VideoBlockResolver', () => {
  let resolver: VideoBlockResolver, service: BlockService

  const blockCreate: VideoBlockCreateInput = {
    id: 'abc',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId'
  }

  const createdBlock: VideoBlock = {
    id: 'abc',
    __typename: 'VideoBlock',
    parentOrder: 0,
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId'
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

  const blockUpdate: VideoBlockUpdateInput = {
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    startAt: 5,
    endAt: 10,
    muted: true,
    autoplay: true,
    posterBlockId: 'posterBlockId',
    fullsize: true
  }

  const updatedBlock: VideoBlock = {
    id: 'abc',
    __typename: 'VideoBlock',
    parentOrder: 0,
    journeyId: 'journeyId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    startAt: 5,
    endAt: 10,
    muted: true,
    autoplay: true,
    posterBlockId: 'posterBlockId',
    fullsize: true
  }

  beforeEach(async () => {
    const blockService = {
      provide: BlockService,
      useFactory: () => ({
        get: jest.fn((id) =>
          id === createdBlock.id ? createdBlock : parentBlock
        ),
        removeBlockAndChildren: jest.fn((input) => input),
        save: jest.fn((input) => createdBlock),
        update: jest.fn((id, input) => updatedBlock),
        getSiblings: jest.fn(() => [])
      })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        VideoBlockResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<VideoBlockResolver>(VideoBlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('videoBlockCreate', () => {
    it('creates a VideoBlock', async () => {
      await resolver.videoBlockCreate(blockCreate)
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockCreate.journeyId,
        blockCreate.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(createdBlock)
    })

    it('creates a cover VideoBlock', async () => {
      await resolver.videoBlockCreate({ ...blockCreate, isCover: true })

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

  describe('videoBlockUpdate', () => {
    it('updates a VideoBlock', async () => {
      expect(
        await resolver.videoBlockUpdate('blockId', 'journeyId', blockUpdate)
      ).toEqual(updatedBlock)
    })
  })

  describe('video', () => {
    it('returns video for external resolution', async () => {
      expect(await resolver.video(createdBlock)).toEqual({
        __typename: 'Video',
        id: 'videoId',
        primaryLanguageId: 'videoVariantLanguageId'
      })
    })

    it('returns null if videoId is not set', async () => {
      expect(
        await resolver.video({ ...createdBlock, videoId: undefined })
      ).toEqual(null)
    })

    it('returns null if videoVariantLanguageId is not set', async () => {
      expect(
        await resolver.video({
          ...createdBlock,
          videoVariantLanguageId: undefined
        })
      ).toEqual(null)
    })
  })
})
