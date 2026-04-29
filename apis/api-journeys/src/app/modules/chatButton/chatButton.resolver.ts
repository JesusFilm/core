import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { ChatButton } from '@core/prisma/journeys/client'

import { PrismaService } from '../../lib/prisma.service'
import { JourneyCustomizableService } from '../journey/journeyCustomizable.service'

@Resolver('ChatButton')
export class ChatButtonResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly journeyCustomizableService: JourneyCustomizableService
  ) {}

  @Mutation()
  async chatButtonRemove(@Args('id') id: string): Promise<ChatButton> {
    const result = await this.prismaService.chatButton.delete({
      where: {
        id
      }
    })
    await this.journeyCustomizableService.recalculate(result.journeyId)
    return result
  }
}
