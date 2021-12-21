import { Test, TestingModule } from '@nestjs/testing'
import { ThemeMode, ThemeName } from '../../../__generated__/graphql'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import { CardBlockResolvers } from './card.resolvers'

describe('Card', () => {
  let blockResolver: BlockResolvers,
    cardBlockResolver: CardBlockResolvers,
    service: BlockService

  const block = {
    _key: '1',
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
    __typename: '',
    journeyId: '2',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockCreateResponse = {
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

  const blockresponse = {
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

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockResolvers, blockService, CardBlockResolvers]
    }).compile()
    blockResolver = module.get<BlockResolvers>(BlockResolvers)
    cardBlockResolver = module.get<CardBlockResolvers>(CardBlockResolvers)
    service = await module.resolve(BlockService)
  })

  describe('CardBlock', () => {
    it('returns CardBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockresponse)
      expect(await blockResolver.blocks()).toEqual([
        blockresponse,
        blockresponse
      ])
    })
  })

  describe('cardBlockCreate', () => {
    it('creates a CardBlock', async () => {
      cardBlockResolver
        .cardBlockCreate(blockUpdate)
        .catch((err) => console.log(err))
      expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
    })
  })

  describe('cardBlockUpdate', () => {
    it('updates a CardBlock', async () => {
      cardBlockResolver
        .cardBlockUpdate(block._key, blockUpdate)
        .catch((err) => console.log(err))
      expect(service.update).toHaveBeenCalledWith(block._key, blockUpdate)
    })
  })
})
