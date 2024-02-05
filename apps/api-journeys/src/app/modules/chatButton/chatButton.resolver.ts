import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { ChatButton } from '.prisma/api-journeys-client'

import {
  ChatButtonCreateInput,
  ChatButtonType,
  ChatButtonUpdateInput
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('ChatButton')
export class ChatButtonResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  async chatButtonCreate(
    @Args('journeyId') journeyId: string,
    @Args('input') input: ChatButtonCreateInput
  ): Promise<ChatButton> {
    const chatButtons = await this.prismaService.chatButton.findMany({
      where: { journeyId }
    })

    if (chatButtons.length < 2) {
      return await this.prismaService.chatButton.create({
        data: {
          journeyId,
          ...input,
          type: input.type || ChatButtonType.link
        }
      })
    } else {
      throw new Error(
        'There are already 2 chat buttons associated with the given journey'
      )
    }
  }

  @Mutation()
  async chatButtonUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: ChatButtonUpdateInput
  ): Promise<ChatButton> {
    return await this.prismaService.chatButton.update({
      where: {
        id
      },
      data: {
        journeyId,
        ...input,
        type: input.type || ChatButtonType.link
      }
    })
  }

  @Mutation()
  async chatButtonRemove(@Args('id') id: string): Promise<ChatButton> {
    return await this.prismaService.chatButton.delete({
      where: {
        id
      }
    })
  }
}
