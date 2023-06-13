import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolver } from '../../block/block.resolver'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../../block/block.service'
import { ActionResolver } from '../action.resolver'
import { LinkActionResolver } from './linkAction.resolver'

describe('LinkActionResolver', () => {
  let resolver: LinkActionResolver, prismaService: PrismaService

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
      url: 'https://google.com'
    }
  }

  const linkActionInput = {
    gtmEventName: 'gtmEventName',
    email: null,
    url: 'https://google.com',
    blockId: null,
    journeyId: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        BlockService,
        LinkActionResolver,
        ActionResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<LinkActionResolver>(LinkActionResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    prismaService.action.update = jest
      .fn()
      .mockResolvedValue((result) => result.data)
  })

  it('updates link action', async () => {
    await resolver.blockUpdateLinkAction(
      block.id,
      block.journeyId,
      linkActionInput
    )
    expect(prismaService.action.update).toHaveBeenCalledWith({
      where: { id: block.id }, data: {
        ...linkActionInput, parentBlockId: block.action.parentBlockId
      }
    })
  })

  it('throws an error if typename is wrong', async () => {
    const wrongBlock = {
      ...block,
      typename: 'WrongBlock'
    }
    prismaService.block.findUnique = jest.fn().mockResolvedValue(wrongBlock)
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
