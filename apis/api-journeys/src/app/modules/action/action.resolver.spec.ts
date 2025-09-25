import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Action, Block } from '@core/prisma/journeys/client'

import { PrismaService } from '../../lib/prisma.service'

import { ActionResolver } from './action.resolver'

describe('ActionResolver', () => {
  let resolver: ActionResolver, prismaService: DeepMockProxy<PrismaService>

  const block = {
    id: '1',
    journeyId: '2',
    typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description'
  } as unknown as Block

  const emailAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: null,
    target: null,
    url: null,
    email: 'john.smith@example.com',
    phone: null,
    countryCode: null,
    contactAction: null,
    customizable: null,
    parentStepId: null
  }
  const linkAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: null,
    target: 'target',
    url: 'https://google.com',
    email: null,
    phone: null,
    countryCode: null,
    contactAction: null,
    customizable: null,
    parentStepId: null
  }
  const navigateToBlockAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: '4',
    journeyId: null,
    target: null,
    url: null,
    email: null,
    phone: null,
    countryCode: null,
    contactAction: null,
    customizable: null,
    parentStepId: null
  }
  const phoneAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: null,
    target: null,
    url: null,
    email: null,
    phone: '1234567890',
    countryCode: 'US',
    contactAction: null,
    customizable: null,
    parentStepId: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ActionResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<ActionResolver>(ActionResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('__resolveType', () => {
    it('returns EmailAction', () => {
      expect(resolver.__resolveType(emailAction)).toBe('EmailAction')
    })

    it('returns LinkAction', () => {
      expect(resolver.__resolveType(linkAction)).toBe('LinkAction')
    })

    it('returns NavigateToBlockAction', () => {
      expect(resolver.__resolveType(navigateToBlockAction)).toBe(
        'NavigateToBlockAction'
      )
    })

    it('returns PhoneAction', () => {
      expect(resolver.__resolveType(phoneAction)).toBe('PhoneAction')
    })
  })

  describe('parentBlock', () => {
    it('returns parentBlock', async () => {
      const action = {
        ...emailAction,
        parentBlock: block
      }
      expect(await resolver.parentBlock(action)).toBe(block)
    })

    it('returns block', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      const action = {
        ...emailAction,
        parentBlockId: block.id
      }
      expect(await resolver.parentBlock(action)).toBe(block)
    })
  })
})
