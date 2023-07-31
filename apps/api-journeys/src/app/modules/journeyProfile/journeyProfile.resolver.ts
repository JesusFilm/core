import { Resolver, Query, Mutation } from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { JourneyProfile } from '.prisma/api-journeys-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { GraphQLError } from 'graphql'
import { subject } from '@casl/ability'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileUpdateInput } from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { Action, AppAbility } from '../../lib/casl/caslFactory'

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

  // @Mutation()
  // @UseGuards(AppCaslGuard)
  // async journeyProfileUpdate(
  //   @CaslAbility() ability: AppAbility,
  //   input: JourneyProfileUpdateInput
  // ): Promise<JourneyProfile> {
  //   if (input.lastActiveTeamId != null) {
  //     const team = await this.prismaService.team.findUnique({
  //       where: { id: input.lastActiveTeamId }
  //     })

  //     if (team == null) {
  //       throw new GraphQLError('team not found', {
  //         extensions: { code: 'NOT_FOUND' }
  //       })
  //     }
  //     if (!ability.can(Action.Read, subject('Team', team))) {
  //       throw new GraphQLError('user is not allowed to view team', {
  //         extensions: { code: 'FORBIDDEN' }
  //       })
  //     }
  //     input.lastActiveTeamId = team.id
  //   }

  //   return await this.prismaService.journeyProfile.update({
  //     where: { id },
  //     data: {
  //       ...input,
  //       lastActiveTeamId: input.lastActiveTeamId
  //     }
  //   })
  // }
}
