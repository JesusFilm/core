import { Test, TestingModule } from '@nestjs/testing'

import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import {
  IconBlockCreateInput,
  IconColor,
  IconName,
  IconSize
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { JourneyService } from '../../journey/journey.service'
import { PrismaService } from '../../../lib/prisma.service'
import { IconBlockResolver } from './icon.resolver'

describe('Icon', () => {
  let resolver: BlockResolver,
    iconBlockResolver: IconBlockResolver,
    service: BlockService,
    prisma: PrismaService

  const block = {
    id: '1',
    journeyId: '2',
    typename: 'IconBlock',
    parentBlockId: '0',
    parentOrder: 0,
    name: 'ArrowForwardRounded',
    color: 'secondary',
    size: 'lg'
  }

  const input: IconBlockCreateInput = {
    id: '1',
    parentBlockId: '0',
    journeyId: '2',
    name: IconName.ArrowForwardRounded,
    color: IconColor.secondary,
    size: IconSize.lg
  }

  const create = {
    id: '1',
    journey: {
      connect: { id: '2' }
    },
    typename: 'IconBlock',
    parentBlockId: '0',
    parentOrder: null,
    name: 'ArrowForwardRounded',
    color: 'secondary',
    size: 'lg'
  }

  const inputUpdate = {
    journeyId: '2',
    parentBlockId: '0',
    name: IconName.PlayArrowRounded,
    color: IconColor.primary,
    size: IconSize.sm
  }

  const updateResponse = {
    journeyId: '2',
    parentBlockId: '0',
    name: 'PlayArrowRounded',
    color: 'primary',
    size: 'sm'
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        IconBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    iconBlockResolver = module.get<IconBlockResolver>(IconBlockResolver)
    resolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
    prisma = await module.resolve(PrismaService)
    prisma.block.findUnique = jest.fn().mockResolvedValue(block)
    prisma.block.findMany = jest.fn().mockResolvedValue([block, block])
  })

  describe('IconBlock', () => {
    it('returns IconBlock', async () => {
      expect(await resolver.block('1')).toEqual(block)
      expect(await resolver.blocks()).toEqual([block, block])
    })
  })

  describe('IconBlockCreate', () => {
    it('creates an IconBlock', async () => {
      await iconBlockResolver.iconBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(create)
    })
  })

  describe('IconBlockUpdate', () => {
    it('updates a IconBlock', async () => {
      void iconBlockResolver.iconBlockUpdate(
        block.id,
        block.journeyId,
        inputUpdate
      )
      expect(service.update).toHaveBeenCalledWith(block.id, updateResponse)
    })
  })
})
