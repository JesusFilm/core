import { Test, TestingModule } from '@nestjs/testing'
import { ThemeMode, ThemeName } from '../../../graphql'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('Card', () => {
  let resolver: BlockResolvers

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
      getAll: jest.fn(() => [block, block])
    })
  }

 
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockResolvers, blockservice]
    }).compile()
    resolver = module.get<BlockResolvers>(BlockResolvers)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('CardBlock', () => {
    it('returns CardBlock', async () => {
      expect(resolver.block("1")).resolves.toEqual(blockresponse)
      expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
