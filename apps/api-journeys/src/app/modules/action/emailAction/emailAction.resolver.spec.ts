import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../../lib/prisma.service'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { ActionResolver } from '../action.resolver'
import { EmailActionResolver } from './emailAction.resolver'

describe('EmailActionResolver', () => {
  let resolver: EmailActionResolver, prismaService: PrismaService
  const block = {
    id: '1',
    journeyId: '2',
    typename: 'RadioOptionBlock',
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailActionResolver,
        ActionResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<EmailActionResolver>(EmailActionResolver)
    prismaService = await module.resolve(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    prismaService.action.update = jest
      .fn()
      .mockResolvedValue((result) => result.data)
  })

  it('updates email action', async () => {
    await resolver.blockUpdateEmailAction(
      block.id,
      block.journeyId,
      emailActionInput
    )
    expect(prismaService.action.update).toHaveBeenCalledWith({
      where: { id: block.id },
      data: {
        ...emailActionInput, parentBlockId: block.action.parentBlockId
      }
    })
  })

  it('throws an error if typename is wrong', async () => {
    const wrongBlock = {
      ...block,
      __typename: 'WrongBlock'
    }
    prismaService.block.findUnique = jest.fn().mockResolvedValue(wrongBlock)
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
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    await resolver
      .blockUpdateEmailAction(block.id, block.journeyId, wrongEmailInput)
      .catch((error) => {
        expect(error.message).toEqual('must be a valid email')
      })
  })
})
