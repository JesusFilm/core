import { UseGuards } from '@nestjs/common'
import { Mutation, Resolver } from '@nestjs/graphql'

import { JourneyProfile } from '@core/prisma/journeys/client'

import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { CurrentUser } from '../../lib/decorators/CurrentUser'
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
}
