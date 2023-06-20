import { Test, TestingModule } from '@nestjs/testing'
import { BlockService } from '../../block/block.service'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { ActionResolver } from '../action.resolver'
import { NavigateActionResolver } from './navigateAction.resolver'

describe('NavigateActionResolver', () => {
  let resolver: NavigateActionResolver, prismaService: PrismaService

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
      gtmEventName: 'gtmEventName'
    }
  }

  const navigateActionInput = {
    gtmEventName: 'gtmEventNameUpdated',
    blockId: null,
    email: null,
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
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<NavigateActionResolver>(NavigateActionResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    prismaService.action.upsert = jest
      .fn()
      .mockResolvedValue((result) => result.data)
  })

  it('updates navigate action', async () => {
    await resolver.blockUpdateNavigateAction(
      block.id,
      block.journeyId,
      navigateActionInput
    )
    const actionData = {
      ...navigateActionInput,
      parentBlockId: block.action.parentBlockId
    }
    expect(prismaService.action.upsert).toHaveBeenCalledWith({
      where: { id: block.id },
      create: { ...actionData, block: { connect: { id: block.id } } },
      update: actionData
    })
  })

  it('throws an error if typename is wrong', async () => {
    const wrongBlock = {
      ...block,
      __typename: 'WrongBlock'
    }
    prismaService.block.findUnique = jest.fn().mockResolvedValue(wrongBlock)
    await resolver
      .blockUpdateNavigateAction(
        wrongBlock.id,
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
