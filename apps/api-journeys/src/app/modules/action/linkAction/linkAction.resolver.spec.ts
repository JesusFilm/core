import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { BlockResolver } from '../../block/block.resolver'
import { BlockService } from '../../block/block.service'
import { JourneyService } from '../../journey/journey.service'
import { MemberService } from '../../member/member.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { ActionResolver } from '../action.resolver'
import { LinkActionResolver } from './linkAction.resolver'

describe('LinkActionResolver', () => {
  let resolver: LinkActionResolver, service: BlockService

  const block = {
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
        get: jest.fn().mockResolvedValue(block),
        update: jest.fn((navigateToBlockInput) => navigateToBlockInput)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        LinkActionResolver,
        ActionResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        MemberService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<LinkActionResolver>(LinkActionResolver)
    service = await module.resolve(BlockService)
  })

  it('updates link action', async () => {
    await resolver.blockUpdateLinkAction(
      block.id,
      block.journeyId,
      linkActionInput
    )
    expect(service.update).toHaveBeenCalledWith(block.id, {
      action: { ...linkActionInput, parentBlockId: block.action.parentBlockId }
    })
  })

  it('throws an error if typename is wrong', async () => {
    const wrongBlock = {
      ...block,
      __typename: 'WrongBlock'
    }
    service.get = jest.fn().mockResolvedValue(wrongBlock)
    await resolver
      .blockUpdateLinkAction(
        wrongBlock.id,
        wrongBlock.journeyId,
        linkActionInput
      )
      .catch((error) => {
        expect(error.message).toEqual(
          'This block does not support link actions'
        )
      })
  })
})
