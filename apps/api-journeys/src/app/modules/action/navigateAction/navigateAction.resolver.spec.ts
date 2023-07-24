import { Test, TestingModule } from '@nestjs/testing'
import omit from 'lodash/omit'

import { BlockService } from '../../block/block.service'
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        NavigateActionResolver,
        ActionResolver,
        UserJourneyService,
        UserRoleService,
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
    const actionData = omit(navigateActionInput)
    expect(prismaService.action.upsert).toHaveBeenCalledWith({
      where: { parentBlockId: block.id },
      create: { ...actionData, parentBlock: { connect: { id: block.id } } },
      update: {
        ...actionData,
        journey: { disconnect: true },
        block: { disconnect: true }
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
