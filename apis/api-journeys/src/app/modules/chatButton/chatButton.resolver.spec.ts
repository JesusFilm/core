import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { MessagePlatform } from '../../__generated__/graphql'
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

  const chatButton2 = {
    journeyId: 'journeyId',
    id: '2',
    link: 'm.me./user2',
    platform: 'facebook',
    customizable: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatButtonResolver,
        PrismaService,
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
    prismaService.chatButton.findMany = jest.fn().mockReturnValue([])
  })

  it('should create a new ChatButton', async () => {
    prismaService.chatButton.create = jest
      .fn()
      .mockReturnValue([{ journeyId: 'journeyId', id: '1' }])

    const result = await resolver.chatButtonCreate('journeyId', {})
    expect(result).toEqual([{ id: '1', journeyId: 'journeyId' }])
  })

  it('should create a new custom ChatButton', async () => {
    prismaService.chatButton.create = jest.fn().mockReturnValue([
      {
        journeyId: 'journeyId',
        id: '1',
        input: { platform: MessagePlatform.custom }
      }
    ])

    const result = await resolver.chatButtonCreate('journeyId', {})
    expect(result).toEqual([
      {
        id: '1',
        journeyId: 'journeyId',
        input: { platform: MessagePlatform.custom }
      }
    ])
  })

  it('should not create more than two ChatButtons', async () => {
    prismaService.chatButton.findMany = jest
      .fn()
      .mockReturnValue([chatButton, chatButton2])
    prismaService.chatButton.create = jest
      .fn()
      .mockReturnValue([{ journeyId: 'journeyId', id: '3' }])

    await expect(resolver.chatButtonCreate('journeyId', {})).rejects.toThrow(
      'There are already 2 chat buttons associated with the given journey'
    )
  })

  it('should update an existing ChatButton', async () => {
    prismaService.chatButton.findMany = jest.fn().mockReturnValue([chatButton])
    prismaService.chatButton.update = jest
      .fn()
      .mockReturnValue([
        { ...chatButton, link: 'm.me/username', platform: 'viber' }
      ])

    const result = await resolver.chatButtonUpdate('1', 'journeyId', {
      link: 'm.me/username',
      platform: MessagePlatform.viber
    })
    expect(result).toEqual([
      {
        id: '1',
        journeyId: 'journeyId',
        link: 'm.me/username',
        platform: 'viber',
        customizable: null
      }
    ])
  })

  it('should update customizable field on a ChatButton', async () => {
    prismaService.chatButton.findMany = jest.fn().mockReturnValue([chatButton])
    prismaService.chatButton.update = jest
      .fn()
      .mockReturnValue({ ...chatButton, customizable: true })

    const result = await resolver.chatButtonUpdate('1', 'journeyId', {
      customizable: true
    })
    expect(prismaService.chatButton.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { journeyId: 'journeyId', customizable: true }
    })
    expect(result).toEqual({
      ...chatButton,
      customizable: true
    })
  })

  it('should forward customizable null to prisma update', async () => {
    prismaService.chatButton.findMany = jest.fn().mockReturnValue([chatButton])
    prismaService.chatButton.update = jest
      .fn()
      .mockReturnValue({ ...chatButton, customizable: null })

    await resolver.chatButtonUpdate('1', 'journeyId', {
      customizable: null
    })
    expect(prismaService.chatButton.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { journeyId: 'journeyId', customizable: null }
    })
  })

  it('should delete an existing ChatButton', async () => {
    prismaService.chatButton.findMany = jest.fn().mockReturnValue([chatButton])
    prismaService.chatButton.delete = jest.fn().mockReturnValue(chatButton)

    const result = await resolver.chatButtonRemove('1')
    expect(result).toEqual(chatButton)
  })

  it('should call recalculate after chatButtonUpdate', async () => {
    prismaService.chatButton.findMany = jest.fn().mockReturnValue([chatButton])
    prismaService.chatButton.update = jest
      .fn()
      .mockReturnValue({ ...chatButton, customizable: true })

    await resolver.chatButtonUpdate('1', 'journeyId', {
      customizable: true
    })

    expect(journeyCustomizableService.recalculate).toHaveBeenCalledWith(
      'journeyId'
    )
  })

  it('should call recalculate after chatButtonRemove', async () => {
    prismaService.chatButton.delete = jest.fn().mockReturnValue(chatButton)

    await resolver.chatButtonRemove('1')

    expect(journeyCustomizableService.recalculate).toHaveBeenCalledWith(
      'journeyId'
    )
  })
})
