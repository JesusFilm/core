import { Test, TestingModule } from '@nestjs/testing'

import { Block } from '@core/prisma/journeys/client'

import { ThemeMode, ThemeName } from '../../../__generated__/graphql'
import { AppCaslFactory } from '../../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../../lib/CaslAuthModule'

import { CardBlockResolver } from './card.resolver'

describe('CardBlockResolver', () => {
  let resolver: CardBlockResolver

  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    typename: 'CardBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    backgroundColor: '#FFF',
    fullscreen: true,
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    updatedAt: '2024-10-21T04:32:25.858Z'
  } as unknown as Block

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [CardBlockResolver]
    }).compile()
    resolver = module.get<CardBlockResolver>(CardBlockResolver)
  })

  describe('fullscreen', () => {
    it('returns fullscreen when true', () => {
      expect(resolver.fullscreen({ ...block, fullscreen: true })).toBe(true)
    })

    it('returns fullscreen when false', () => {
      expect(resolver.fullscreen({ ...block, fullscreen: false })).toBe(false)
    })

    it('returns false when fullscreen is null', () => {
      expect(resolver.fullscreen({ ...block, fullscreen: null })).toBe(false)
    })
  })
})
