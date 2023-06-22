import { Test, TestingModule } from '@nestjs/testing'

import { Action, RadioOptionBlock } from '../../__generated__/graphql'
import { BlockResolver } from '../block/block.resolver'
import { BlockService } from '../block/block.service'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserRoleService } from '../userRole/userRole.service'
import { PrismaService } from '../../lib/prisma.service'
import { ActionResolver } from './action.resolver'

describe('ActionResolver', () => {
  let resolver: ActionResolver,
    blockResolver: BlockResolver,
    prismaService: PrismaService

  const block1 = {
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
      blockId: '4'
    }
  }

  const block2 = {
    ...block1,
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const block3 = {
    ...block1,
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  const block4 = {
    ...block1,
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  const block5 = {
    ...block1,
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      email: 'imissedmondshen@gmail.com'
    }
  }

  describe('__resolveType', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockService,
          ActionResolver,
          UserJourneyService,
          UserRoleService,
          JourneyService,
          PrismaService
        ]
      }).compile()
      resolver = module.get<ActionResolver>(ActionResolver)
    })

    it('returns NavigateAction', () => {
      const action = {
        blockId: null,
        journeyId: null,
        url: null,
        target: null
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('NavigateAction')
    })

    it('returns NavigateToBlockAction', () => {
      const action = {
        blockId: '4',
        journeyId: null,
        url: null,
        target: null
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('NavigateToBlockAction')
    })

    it('returns NavigateToJourneyAction', () => {
      const action = {
        blockId: null,
        journeyId: '4',
        url: null,
        target: null
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('NavigateToJourneyAction')
    })

    it('returns LinkAction', () => {
      const action = {
        blockId: null,
        journeyId: null,
        url: 'https://google.com',
        target: 'target'
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('LinkAction')
    })

    it('returns EmailAction', () => {
      const action = {
        blockId: null,
        journeyId: null,
        target: null,
        url: null,
        email: 'imissedmondshen@gmail.com'
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('EmailAction')
    })
  })

  describe('NavigateToBlockAction', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolver,
          BlockService,
          UserJourneyService,
          UserRoleService,
          JourneyService,
          PrismaService
        ]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
      prismaService = module.get<PrismaService>(PrismaService)
      prismaService.block.findUnique = jest.fn().mockReturnValue(block1)
    })
    it('returns NavigateToBlockAction', async () => {
      expect(await blockResolver.block('1')).toEqual(block1)
      expect(
        ((await blockResolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('blockId')
    })
  })

  describe('NavigateToJourneyAction', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolver,
          BlockService,
          UserJourneyService,
          UserRoleService,
          JourneyService,
          PrismaService
        ]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
      prismaService = module.get<PrismaService>(PrismaService)
      prismaService.block.findUnique = jest.fn().mockReturnValue(block2)
    })
    it('returns NavigateToBlockAction', async () => {
      expect(await blockResolver.block('1')).toEqual(block2)
      expect(
        ((await blockResolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('journeyId')
    })
  })

  describe('LinkAction', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolver,
          BlockService,
          UserJourneyService,
          UserRoleService,
          JourneyService,
          PrismaService
        ]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
      prismaService = module.get<PrismaService>(PrismaService)
      prismaService.block.findUnique = jest.fn().mockReturnValue(block3)
    })
    it('returns LinkAction', async () => {
      expect(await blockResolver.block('1')).toEqual(block3)
      expect(
        ((await blockResolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('url')
    })
  })

  describe('EmailAction', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolver,
          BlockService,
          UserJourneyService,
          UserRoleService,
          JourneyService,
          PrismaService
        ]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
      prismaService = module.get<PrismaService>(PrismaService)
      prismaService.block.findUnique = jest.fn().mockReturnValue(block5)
    })
    it('returns EmailAction', async () => {
      expect(await blockResolver.block('1')).toEqual(block5)
      expect(
        ((await blockResolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('email')
    })
  })

  describe('NavigateAction', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolver,
          BlockService,
          UserJourneyService,
          UserRoleService,
          JourneyService,
          PrismaService
        ]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
      prismaService = module.get<PrismaService>(PrismaService)
      prismaService.block.findUnique = jest.fn().mockReturnValueOnce(block4)
    })
    it('returns NavigateAction', async () => {
      expect(await blockResolver.block('1')).toEqual(block4)
    })
  })

  describe('blockDeleteAction', () => {
    const emptyAction = { action: null }
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockService,
          ActionResolver,
          UserJourneyService,
          UserRoleService,
          JourneyService,
          PrismaService
        ]
      }).compile()
      resolver = module.get<ActionResolver>(ActionResolver)
      prismaService = module.get<PrismaService>(PrismaService)
      prismaService.block.findUnique = jest.fn().mockReturnValueOnce(block1)
      prismaService.action.delete = jest.fn().mockReturnValueOnce(emptyAction)
    })
    it('removes the block action', async () => {
      await resolver.blockDeleteAction(block1.id, block1.journeyId)

      expect(prismaService.action.delete).toHaveBeenCalledWith({
        where: { parentBlockId: block1.id }
      })
    })
  })
})
