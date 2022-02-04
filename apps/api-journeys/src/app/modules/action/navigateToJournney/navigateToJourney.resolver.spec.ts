import { Test, TestingModule } from '@nestjs/testing'
import { JourneyStatus } from '../../../__generated__/graphql'
import { BlockResolver } from '../../block/block.resolver'
import { BlockService } from '../../block/block.service'
import { JourneyService } from '../../journey/journey.service'
import { NavigateToJourneyActionResolver } from './navigateToJourney.resolver'

describe('NavigateToJourneyActionResolver', () => {
  let resolver: NavigateToJourneyActionResolver, blockresolver: BlockResolver

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const blockResponse = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const journey = {
    _key: '4',
    title: 'Fact or Fiction',
    status: JourneyStatus.published,
    locale: 'en-US',
    themeMode: 'light',
    themeName: 'base',
    slug: 'fact-or-fiction'
  }

  const journeyResponse = {
    id: '4',
    title: 'Fact or Fiction',
    status: JourneyStatus.published,
    locale: 'en-US',
    themeMode: 'light',
    themeName: 'base',
    slug: 'fact-or-fiction'
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }
  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn(() => journey)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        NavigateToJourneyActionResolver,
        blockService,
        journeyService
      ]
    }).compile()
    resolver = module.get<NavigateToJourneyActionResolver>(
      NavigateToJourneyActionResolver
    )
    blockresolver = module.get<BlockResolver>(BlockResolver)
  })

  describe('NavigateToJourneyAction', () => {
    it('returns NavigateToJourneyAction', async () => {
      expect(await blockresolver.block('1')).toEqual(blockResponse)
    })

    it('returns Journey from action', async () => {
      expect(await resolver.journey(block.action)).toEqual(journeyResponse)
    })
  })
})
