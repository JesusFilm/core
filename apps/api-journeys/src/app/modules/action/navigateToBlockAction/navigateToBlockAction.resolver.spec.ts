import { Test, TestingModule } from '@nestjs/testing'
import { BlockService } from '../../block/block.service'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { ActionResolver } from '../action.resolver'
import { NavigateToBlockActionResolver } from './navigateToBlockAction.resolver'

describe('NavigateToBlockActionResolver', () => {
  let resolver: NavigateToBlockActionResolver, prismaService: PrismaService

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
      blockId: '4'
    }
  }

  const navigateToBlockInput = {
    gtmEventName: 'gtmEventName',
    blockId: '4',
    email: null,
    journeyId: null,
    url: null,
    target: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        NavigateToBlockActionResolver,
        ActionResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService,
      ]
    }).compile()
    resolver = module.get<NavigateToBlockActionResolver>(
      NavigateToBlockActionResolver
    )
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    prismaService.action.update = jest.fn().mockResolvedValue((result) => result.data)
  })

  it('updates the navigate to block action', async () => {
    await resolver.blockUpdateNavigateToBlockAction(
      block.id,
      block.journeyId,
      navigateToBlockInput
    )
    expect(prismaService.action.update).toHaveBeenCalledWith({
      where: { id: block.id },
      data: {
        ...navigateToBlockInput,
        parentBlockId: block.action.parentBlockId
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
      .blockUpdateNavigateToBlockAction(
        wrongBlock.id,
        wrongBlock.journeyId,
        navigateToBlockInput
      )
      .catch((error) => {
        expect(error.message).toEqual(
          'This block does not support navigate to block actions'
        )
      })
  })
})
