import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { BlockResolver } from '../../block/block.resolver'
import { BlockService } from '../../block/block.service'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { ActionResolver } from '../action.resolver'
import { PrismaService } from '../../../lib/prisma.service'
import { EmailActionResolver } from './emailAction.resolver'

describe('EmailActionResolver', () => {
  let resolver: EmailActionResolver, service: BlockService

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
      email: ''
    }
  }

  const emailActionInput = {
    gtmEventName: 'gtmEventName',
    email: 'edmondshen@gmail.com',
    blockId: null,
    journeyId: null,
    target: null,
    url: null
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
        EmailActionResolver,
        ActionResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<EmailActionResolver>(EmailActionResolver)
    service = await module.resolve(BlockService)
  })

  it('updates email action', async () => {
    await resolver.blockUpdateEmailAction(
      block.id,
      block.journeyId,
      emailActionInput
    )
    expect(service.update).toHaveBeenCalledWith(block.id, {
      action: { ...emailActionInput, parentBlockId: block.action.parentBlockId }
    })
  })

  it('throws an error if typename is wrong', async () => {
    const wrongBlock = {
      ...block,
      __typename: 'WrongBlock'
    }
    service.get = jest.fn().mockResolvedValue(wrongBlock)
    await resolver
      .blockUpdateEmailAction(
        wrongBlock.id,
        wrongBlock.journeyId,
        emailActionInput
      )
      .catch((error) => {
        expect(error.message).toEqual(
          'This block does not support email actions'
        )
      })
  })

  it('throws an error if input is not an email address', async () => {
    const wrongEmailInput = {
      ...emailActionInput,
      email: 'tataiwashere.com'
    }
    service.get = jest.fn().mockResolvedValue(block)
    await resolver
      .blockUpdateEmailAction(block.id, block.journeyId, wrongEmailInput)
      .catch((error) => {
        expect(error.message).toEqual('must be a valid email')
      })
  })
})
