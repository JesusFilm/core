import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { BlockService } from '../../block/block.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { ActionResolver } from '../action.resolver'
import { NavigateActionResolver } from './navigateAction.resolver'

describe('NavigateActionResolver', () => {
  let resolver: NavigateActionResolver, service: BlockService

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName'
    }
  }

  const navigateActionInput = {
    gtmEventName: 'gtmEventName',
    blockId: null,
    journeyId: null,
    url: null,
    target: null
  }

  beforeEach(async () => {
    const blockService = {
      provide: BlockService,
      useFactory: () => ({
        get: jest.fn().mockResolvedValue(block),
        update: jest.fn((navigateActionInput) => navigateActionInput)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        blockService,
        NavigateActionResolver,
        ActionResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<NavigateActionResolver>(NavigateActionResolver)
    service = await module.resolve(BlockService)
  })

  it('updates navigate action', async () => {
    await resolver.blockUpdateNavigateAction(
      block._key,
      block.journeyId,
      navigateActionInput
    )
    expect(service.update).toHaveBeenCalledWith(block._key, {
      action: { ...navigateActionInput }
    })
  })

  it('throws an error if typename is wrong', async () => {
    const wrongBlock = {
      ...block,
      __typename: 'WrongBlock'
    }
    service.get = jest.fn().mockResolvedValue(wrongBlock)
    await resolver
      .blockUpdateNavigateAction(
        wrongBlock._key,
        wrongBlock.journeyId,
        navigateActionInput
      )
      .catch((error) => {
        expect(error.message).toEqual(
          'This block does not support navigate actions'
        )
      })
  })
})
