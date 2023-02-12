import { Resolver, Query, Mutation } from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { JourneyProfile } from '../../__generated__/graphql'
import { JourneyProfileService } from './journeyProfile.service'

@Resolver('JourneyProfile')
export class JourneyProfileResolver {
  constructor(private readonly journeyProfileService: JourneyProfileService) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async getJourneyProfile(
    @CurrentUserId() userId: string
  ): Promise<JourneyProfile> {
    return await this.journeyProfileService.getJourneyProfileByUserId(userId)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyProfileCreate(
    @CurrentUserId() userId: string
  ): Promise<JourneyProfile> {
    const profile = await this.getJourneyProfile(userId)

    // Create profile after accepting terms of service
    if (profile == null) {
      return await this.journeyProfileService.save({
        userId,
        acceptedTermsAt: new Date().toISOString()
      })
    }

    return profile
  }
}
