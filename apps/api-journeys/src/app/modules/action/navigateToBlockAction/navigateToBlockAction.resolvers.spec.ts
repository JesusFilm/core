import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { BlockService } from '../../block/block.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { ActionResolver } from '../action.resolvers'
import { NavigateToBlockActionResolver } from './navigateToBlockAction.resolvers'

describe('ActionResolvers', () => {
  let resolver: NavigateToBlockActionResolver, service: BlockService

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
      blockId: '4'
    }
  }

  const navigateToBlockInput = {
    gtmEventName: 'gtmEventName',
    blockId: '4',
    journeyId: null,
    url: null,
    target: null
  }

  beforeEach(async () => {
    const blockService = {
      provide: BlockService,
      useFactory: () => ({
        update: jest.fn((navigateToBlockInput) => navigateToBlockInput)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        blockService,
        NavigateToBlockActionResolver,
        ActionResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<NavigateToBlockActionResolver>(
      NavigateToBlockActionResolver
    )
    service = await module.resolve(BlockService)
  })

  it('updates the navigate to block action', async () => {
    await resolver.blockUpdateNavigateToBlockAction(
      block._key,
      block.journeyId,
      navigateToBlockInput
    )
    expect(service.update).toHaveBeenCalledWith(block._key, {
      action: { ...navigateToBlockInput }
    })
  })
})
