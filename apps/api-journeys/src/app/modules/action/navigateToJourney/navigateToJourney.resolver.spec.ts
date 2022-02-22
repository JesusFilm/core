import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep } from 'jest-mock-extended'
import { Database } from 'arangojs'
import { JourneyStatus } from '../../../__generated__/graphql'
import { BlockResolver } from '../../block/block.resolver'
import { BlockService } from '../../block/block.service'
import { JourneyService } from '../../journey/journey.service'
import { ActionResolver } from '../action.resolver'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { NavigateToJourneyActionResolver } from './navigateToJourney.resolver'

describe('NavigateToJourneyActionResolver', () => {
  let resolver: NavigateToJourneyActionResolver,
    blockResolver: BlockResolver,
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
      parentBlockId: '1',
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
      parentBlockId: '1',
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
        BlockResolver,
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
    blockResolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('NavigateToJourneyAction', () => {
    it('returns NavigateToJourneyAction', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse)
    })

    it('returns Journey from action', async () => {
      expect(await resolver.journey(block.action)).toEqual(journeyResponse)
    })

    it('updates the navigate to journey action', async () => {
      await resolver.blockUpdateNavigateToJourneyAction(
        block._key,
        block.journeyId,
        navigateToJourneyInput
      )
      expect(service.update).toHaveBeenCalledWith(block._key, {
        action: {
          ...navigateToJourneyInput,
          parentBlockId: block.action.parentBlockId
        }
      })
    })
  })

  it('throws an error if typename is wrong', async () => {
    const wrongBlock = {
      ...block,
      __typename: 'WrongBlock'
    }
    service.get = jest.fn().mockResolvedValue(wrongBlock)
    await resolver
      .blockUpdateNavigateToJourneyAction(
        wrongBlock._key,
        wrongBlock.journeyId,
        navigateToJourneyInput
      )
      .catch((error) => {
        expect(error.message).toEqual(
          'This block does not support navigate to journey actions'
        )
      })
  })
})
