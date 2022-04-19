import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import { CardBlock, ThemeMode, ThemeName } from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { CardBlockResolver } from './card.resolver'

describe('CardBlockResolver', () => {
  let resolver: CardBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockUpdate = {
    __typename: 'CardBlock',
    journeyId: '2',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockCreateResponse = {
    journeyId: '2',
    __typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 2,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
      getSiblings: jest.fn(() => [block, block]),
      removeBlockAndChildren: jest.fn((input) => input),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        CardBlockResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<CardBlockResolver>(CardBlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('CardBlock', () => {
    it('returns CardBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('cardBlockCreate', () => {
    it('creates a CardBlock', async () => {
      await resolver
        .cardBlockCreate(blockUpdate)
        .catch((err) => console.log(err))
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockUpdate.journeyId,
        blockUpdate.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
    })
  })

  describe('cardBlockUpdate', () => {
    it('updates a CardBlock', async () => {
      await resolver
        .cardBlockUpdate(block.id, block.journeyId, blockUpdate)
        .catch((err) => console.log(err))

      expect(service.removeBlockAndChildren).not.toHaveBeenCalled()
      expect(service.update).toHaveBeenCalledWith(block.id, blockUpdate)
    })
    it('replaces a CardBlock coverBlock', async () => {
      await resolver
        .cardBlockUpdate(block.id, block.journeyId, {
          ...blockUpdate,
          coverBlockId: '3'
        })
        .catch((err) => console.log(err))
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(
        block.coverBlockId,
        block.journeyId
      )
      expect(service.update).toHaveBeenCalledWith(block.id, {
        ...blockUpdate,
        coverBlockId: '3'
      })
    })
    it('removes a CardBlock coverBlock', async () => {
      await resolver
        .cardBlockUpdate(block.id, block.journeyId, {
          ...blockUpdate,
          coverBlockId: null
        })
        .catch((err) => console.log(err))
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(
        block.coverBlockId,
        block.journeyId
      )
      expect(service.update).toHaveBeenCalledWith(block.id, {
        ...blockUpdate,
        coverBlockId: null
      })
    })
  })

  describe('fullscreen', () => {
    it('returns fullscreen when true', () => {
      expect(
        resolver.fullscreen({ fullscreen: true } as unknown as CardBlock)
      ).toEqual(true)
    })

    it('returns fullscreen when false', () => {
      expect(
        resolver.fullscreen({ fullscreen: false } as unknown as CardBlock)
      ).toEqual(false)
    })

    it('returns false when fullscreen is not set', () => {
      expect(resolver.fullscreen({} as unknown as CardBlock)).toEqual(false)
    })
  })
})
