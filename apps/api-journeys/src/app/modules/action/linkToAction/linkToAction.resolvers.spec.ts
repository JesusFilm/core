import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { BlockResolvers } from '../../block/block.resolvers'
import { BlockService } from '../../block/block.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { ActionResolver } from '../action.resolvers'
import { LinkToActionResolver } from './linkToAction.resolvers'

describe('ActionResolvers', () => {
  let resolver: LinkToActionResolver, service: BlockService

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
      url: 'https://google.com'
    }
  }

  const linkActionInput = {
    gtmEventName: 'gtmEventName',
    url: 'https://google.com',
    blockId: null,
    journeyId: null
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
        BlockResolvers,
        blockService,
        LinkToActionResolver,
        ActionResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<LinkToActionResolver>(LinkToActionResolver)
    service = await module.resolve(BlockService)
  })

  it('updates link action', async () => {
    await resolver.blockUpdateLinkAction(
      block._key,
      block.journeyId,
      linkActionInput
    )
    expect(service.update).toHaveBeenCalledWith(block._key, {
      action: { ...linkActionInput }
    })
  })
})
