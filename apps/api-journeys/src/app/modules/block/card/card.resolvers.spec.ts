import { Test, TestingModule } from '@nestjs/testing'
import { ThemeMode, ThemeName } from '../../../graphql'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import { CardBlockResolvers } from './card.resolvers'

describe('Card', () => {
  let blockResolver: BlockResolvers, cardBlockResolver: CardBlockResolvers, service: BlockService

  const block = {
    _key: "1",
    journeyId: "2",
    type: 'CardBlock',
    parentBlockId: "3",
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: "4",
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockUpdate = {
    journeyId: "2",
    parentBlockId: "3",
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: "4",
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockCreateResponse = {
    journeyId: "2",
    type: 'CardBlock',
    parentBlockId: "3",
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: "4",
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }
  
  const blockresponse = {
    id: "1",
    journeyId: "2",
    type: 'CardBlock',
    parentBlockId: "3",
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: "4",
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }
  
  const blockservice = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() =>  block),
      getAll: jest.fn(() => [block, block]),
      save: jest.fn(input => input),
      update: jest.fn(input => input)
    })
  }

 
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockResolvers, blockservice, CardBlockResolvers]
    }).compile()
    blockResolver = module.get<BlockResolvers>(BlockResolvers)
    cardBlockResolver = module.get<CardBlockResolvers>(CardBlockResolvers)
    service = await module.resolve(BlockService)
  })

  it('should be defined', () => {
    expect(blockResolver).toBeDefined()
  })

  describe('CardBlock', () => {
    it('returns CardBlock', async () => {
      expect(blockResolver.block("1")).resolves.toEqual(blockresponse)
      expect(blockResolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })

  describe('cardBlockCreate', () => {
    it('creates a CardBlock', async () => {
      cardBlockResolver.cardBlockCreate(blockUpdate)
      expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
    })
  })

  describe('cardBlockUpdate', () => {
    it('updates a CardBlock', async () => {
      cardBlockResolver.cardBlockUpdate(block._key, blockUpdate)
      expect(service.update).toHaveBeenCalledWith(block._key, blockUpdate)
    })
  })
})
