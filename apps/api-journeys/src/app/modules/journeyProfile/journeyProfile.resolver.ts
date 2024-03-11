import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { JourneyProfile } from '.prisma/api-journeys-client'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import { JourneyProfileUpdateInput } from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'
import { MailChimpService } from '../mailChimp/mailChimp.service'

const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache(),
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? ''
  }
})

@Resolver('JourneyProfile')
export class JourneyProfileResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailChimpService: MailChimpService
  ) {}

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
      const createdProfile = await this.prismaService.journeyProfile.create({
        data: {
          userId,
          acceptedTermsAt: new Date()
        }
      })

      const { data } = await apollo.query({
        query: gql`
          query User($userId: ID!) {
            user(id: $userId) {
              id
              email
              firstName
              lastName
            }
          }
        `,
        variables: { userId: createdProfile.userId }
      })
      await this.mailChimpService.upsertContactToAudience({ ...data.user })
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

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyProfileOnboardingFormComplete(
    @CurrentUserId() userId: string
  ): Promise<JourneyProfile> {
    const profile = await this.getJourneyProfile(userId)

    return await this.prismaService.journeyProfile.update({
      where: { id: profile?.id },
      data: { onboardingFormCompletedAt: new Date() }
    })
  }
}
