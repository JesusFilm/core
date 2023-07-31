import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { JourneyProfile } from '.prisma/api-journeys-client'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileUpdateInput } from '../../__generated__/graphql'

@Resolver('JourneyProfile')
export class JourneyProfileResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async getJourneyProfile(
    @CurrentUserId() userId: string
  ): Promise<JourneyProfile | null> {
    return await this.prismaService.journeyProfile.findUnique({
      where: { userId }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyProfileCreate(
    @CurrentUserId() userId: string
  ): Promise<JourneyProfile> {
    const profile = await this.getJourneyProfile(userId)

    // Create profile after accepting terms of service
    if (profile == null) {
      return await this.prismaService.journeyProfile.create({
        data: {
          userId,
          acceptedTermsAt: new Date()
        }
      })
    }

    return profile
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyProfileUpdate(
    @Args('id') id: string,
    @Args('input') input: JourneyProfileUpdateInput
  ): Promise<JourneyProfile> {
    return await this.prismaService.journeyProfile.update({
      where: { id },
      data: input
    })
  }
}
