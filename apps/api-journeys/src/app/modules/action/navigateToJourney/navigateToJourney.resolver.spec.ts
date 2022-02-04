import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep } from 'jest-mock-extended'
import { Database } from 'arangojs'
import { JourneyStatus } from '../../../__generated__/graphql'
import { BlockResolvers } from '../../block/block.resolvers'
import { BlockService } from '../../block/block.service'
import { JourneyService } from '../../journey/journey.service'
import { ActionResolver } from '../action.resolver'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { NavigateToJourneyActionResolver } from './navigateToJourney.resolver'

describe('ActionResolvers', () => {
  let resolver: NavigateToJourneyActionResolver,
    blockresolver: BlockResolvers,
    service: BlockService

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

  const blockresponse = {
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

  const journeyresponse = {
    id: '4',
    title: 'Fact or Fiction',
    status: JourneyStatus.published,
    locale: 'en-US',
    themeMode: 'light',
    themeName: 'base',
    slug: 'fact-or-fiction'
  }

  const navigateToJourneyInput = {
    gtmEventName: 'gtmEventName',
    journeyId: '4',
    blockId: null,
    url: null,
    target: null
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      update: jest.fn((navigateToJourneyInput) => navigateToJourneyInput)
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
        BlockResolvers,
        NavigateToJourneyActionResolver,
        blockService,
        journeyService,
        ActionResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<NavigateToJourneyActionResolver>(
      NavigateToJourneyActionResolver
    )
    blockresolver = module.get<BlockResolvers>(BlockResolvers)
    service = await module.resolve(BlockService)
  })

  describe('NavigateToJourneyAction', () => {
    it('returns NavigateToJourneyAction', async () => {
      expect(await blockresolver.block('1')).toEqual(blockresponse)
    })

    it('returns Journey from action', async () => {
      expect(await resolver.journey(block.action)).toEqual(journeyresponse)
    })

    it('updates the navigate to journey action', async () => {
      await resolver.blockUpdateNavigateToJourneyAction(
        block._key,
        block.journeyId,
        navigateToJourneyInput
      )
      expect(service.update).toHaveBeenCalledWith(block._key, {
        action: { ...navigateToJourneyInput }
      })
    })
  })
})
