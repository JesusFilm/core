import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'
import { JourneyCustomizableService } from '../journey/journeyCustomizable.service'

import { ChatButtonResolver } from './chatButton.resolver'

describe('ChatButtonResolver', () => {
  let resolver: ChatButtonResolver,
    prismaService: PrismaService,
    journeyCustomizableService: DeepMockProxy<JourneyCustomizableService>

  const chatButton = {
    journeyId: 'journeyId',
    id: '1',
    link: 'm.me./user',
    platform: 'facebook',
    customizable: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatButtonResolver,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: JourneyCustomizableService,
          useValue: mockDeep<JourneyCustomizableService>()
        }
      ]
    }).compile()
    resolver = module.get<ChatButtonResolver>(ChatButtonResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    journeyCustomizableService = module.get<JourneyCustomizableService>(
      JourneyCustomizableService
    ) as DeepMockProxy<JourneyCustomizableService>
  })

  it('should delete an existing ChatButton', async () => {
    prismaService.chatButton.delete = jest.fn().mockReturnValue(chatButton)

    const result = await resolver.chatButtonRemove('1')
    expect(result).toEqual(chatButton)
  })

  it('should call recalculate after chatButtonRemove', async () => {
    prismaService.chatButton.delete = jest.fn().mockReturnValue(chatButton)

    await resolver.chatButtonRemove('1')

    expect(journeyCustomizableService.recalculate).toHaveBeenCalledWith(
      'journeyId'
    )
  })
})
