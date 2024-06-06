import { Test, TestingModule } from '@nestjs/testing'

import { MessagePlatform } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { ChatButtonResolver } from './chatButton.resolver'

describe('ChatButtonResolver', () => {
  let resolver: ChatButtonResolver, prismaService: PrismaService

  const chatButton = {
    journeyId: 'journeyId',
    id: '1',
    link: 'm.me./user',
    platform: 'facebook'
  }

  const chatButton2 = {
    journeyId: 'journeyId',
    id: '2',
    link: 'm.me./user2',
    platform: 'facebook'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatButtonResolver, PrismaService]
    }).compile()
    resolver = module.get<ChatButtonResolver>(ChatButtonResolver)
    prismaService = module.get<PrismaService>(PrismaService)
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
        platform: 'viber'
      }
    ])
  })

  it('should delete an existing ChatButton', async () => {
    prismaService.chatButton.findMany = jest.fn().mockReturnValue([chatButton])
    prismaService.chatButton.delete = jest.fn().mockReturnValue([chatButton])

    const result = await resolver.chatButtonRemove('1')
    expect(result).toEqual([chatButton])
  })
})
