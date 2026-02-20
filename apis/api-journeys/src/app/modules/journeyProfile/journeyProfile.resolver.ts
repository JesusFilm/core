import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { JourneyProfile } from '@core/prisma/journeys/client'

import { JourneyProfileUpdateInput } from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { CurrentUser } from '../../lib/decorators/CurrentUser'
import { CurrentUserId } from '../../lib/decorators/CurrentUserId'
import { User } from '../../lib/firebaseClient'
import { PrismaService } from '../../lib/prisma.service'
import { MailChimpService } from '../mailChimp/mailChimp.service'

@Resolver('JourneyProfile')
export class JourneyProfileResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailChimpService: MailChimpService
  ) {}

  async getJourneyProfile(userId: string): Promise<JourneyProfile | null> {
    return await this.prismaService.journeyProfile.findUnique({
      where: { userId }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyProfileCreate(
    @CurrentUser() user: User
  ): Promise<JourneyProfile> {
    const profile = await this.getJourneyProfile(user.id)

    // Create profile after accepting terms of service
    if (profile == null) {
      const createdProfile = await this.prismaService.journeyProfile.create({
        data: {
          userId: user.id,
          acceptedTermsAt: new Date()
        }
      })

      await this.mailChimpService.syncUser(user)
      return createdProfile
    }

    return profile
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyProfileUpdate(
    @CurrentUserId() userId: string,
    @Args('input') input: JourneyProfileUpdateInput
  ): Promise<JourneyProfile> {
    const profile = await this.getJourneyProfile(userId)

    return await this.prismaService.journeyProfile.update({
      where: { id: profile?.id },
      data: input
    })
  }
}
