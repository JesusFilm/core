import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { JourneyProfile } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileUpdateInput } from '../../__generated__/graphql'

@Resolver('JourneyProfile')
export class JourneyProfileResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async getJourneyProfile(
    @CurrentUserId() userId: string
  ): Promise<JourneyProfile | null> {
    return await this.prismaService.journeyProfile.findUnique({
      where: { userId }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
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
  @UseGuards(GqlAuthGuard)
  async journeyProfileUpdate(
    @Args('id') id: string,
    @Args('input') input: JourneyProfileUpdateInput
  ): Promise<JourneyProfile> {
    return await this.prismaService.journeyProfile.update({
      where: { id },
      data: {
        ...input
      }
    })
  }
}
