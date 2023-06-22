import { Test, TestingModule } from '@nestjs/testing'
import { omit } from 'lodash'

import { JourneyStatus } from '../../../__generated__/graphql'
import { BlockResolver } from '../../block/block.resolver'
import { BlockService } from '../../block/block.service'
import { ActionResolver } from '../action.resolver'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { JourneyService } from '../../journey/journey.service'
import { NavigateToJourneyActionResolver } from './navigateToJourney.resolver'

describe('NavigateToJourneyActionResolver', () => {
  let resolver: NavigateToJourneyActionResolver,
    blockResolver: BlockResolver,
    prismaService: PrismaService

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
      journeyId: '4'
    }
  }

  const journey = {
    id: '4',
    title: 'Fact or Fiction',
    status: JourneyStatus.published,
    languageId: '529',
    themeMode: 'light',
    themeName: 'base',
    slug: 'fact-or-fiction'
  }

  const navigateToJourneyInput = {
    gtmEventName: 'gtmEventName',
    journeyId: '4',
    email: null,
    blockId: null,
    url: null,
    target: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        NavigateToJourneyActionResolver,
        BlockService,
        JourneyService,
        ActionResolver,
        UserJourneyService,
        UserRoleService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<NavigateToJourneyActionResolver>(
      NavigateToJourneyActionResolver
    )
    blockResolver = module.get<BlockResolver>(BlockResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.journey.findUnique = jest.fn().mockResolvedValue(journey)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    prismaService.action.upsert = jest
      .fn()
      .mockResolvedValue((input) => input.data)
  })

  describe('NavigateToJourneyAction', () => {
    it('returns NavigateToJourneyAction', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
    })

    it('returns Journey from action', async () => {
      expect(await resolver.journey(block.action)).toEqual(journey)
    })

    it('updates the navigate to journey action', async () => {
      await resolver.blockUpdateNavigateToJourneyAction(
        block.id,
        block.journeyId,
        navigateToJourneyInput
      )
      const actionData = {
        ...omit(navigateToJourneyInput, 'journeyId'),
        journey: { connect: { id: block.journeyId } }
      }
      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: block.id },
        create: { ...actionData, block: { connect: { id: block.id } } },
        update: actionData
      })
    })
  })

  it('throws an error if typename is wrong', async () => {
    const wrongBlock = {
      ...block,
      __typename: 'WrongBlock'
    }
    prismaService.block.findUnique = jest.fn().mockResolvedValue(wrongBlock)
    await resolver
      .blockUpdateNavigateToJourneyAction(
        wrongBlock.id,
        wrongBlock.journeyId,
        navigateToJourneyInput
      )
      .catch((error) => {
        expect(error.message).toEqual(
          'This block does not support navigate to journey actions'
        )
      })
  })
})
