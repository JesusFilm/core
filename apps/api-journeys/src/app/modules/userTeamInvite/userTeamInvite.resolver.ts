import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { subject } from '@casl/ability'
import {
  CaslGuard,
  CaslAccessible,
  CaslAbility
} from '@core/nest/common/CaslAuthModule'
import { UserTeamInvite, Prisma } from '.prisma/api-journeys-client'
import { GraphQLError } from 'graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CurrentUser } from '@core/nest/decorators/CurrentUser'
import { User } from '@core/nest/common/firebaseClient'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import {
  UserTeamInviteCreateInput,
  UserTeamRole
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('userTeamInvite')
export class TeamResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(GqlAuthGuard, CaslGuard)
  async userTeamInvites(
    @CaslAccessible('UserTeamInvite')
    accessibleUserTeamInvites: Prisma.UserTeamInviteWhereInput,
    @Args('teamId') teamId: string
  ): Promise<UserTeamInvite[]> {
    return await this.prismaService.userTeamInvite.findMany({
      where: {
        AND: [accessibleUserTeamInvites, { teamId }]
      }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard, CaslGuard)
  async userTeamInviteCreate(
    @CaslAbility() ability: AppAbility,
    @CurrentUserId() senderId: string,
    @Args('teamId') teamId: string,
    @Args('input') input: UserTeamInviteCreateInput
  ): Promise<UserTeamInvite> {
    const team = await this.prismaService.team.findUnique({
      where: { id: teamId },
      include: { userTeams: true }
    })
    if (team == null)
      throw new GraphQLError('Team not found.', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Manage, subject('Team', team))) {
      return await this.prismaService.userTeamInvite.upsert({
        where: {
          teamId_email: {
            teamId,
            email: input.email
          }
        },
        create: {
          teamId,
          email: input.email,
          senderId
        },
        update: {
          senderId,
          acceptedAt: null,
          receipientId: null,
          removedAt: null
        }
      })
    }
    throw new GraphQLError('user is not allowed to create userTeamInvite', {
      extensions: { code: 'FORBIDDEN' }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard, CaslGuard)
  async userTeamInviteRemove(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<UserTeamInvite> {
    const userTeamInvite = await this.prismaService.userTeamInvite.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (userTeamInvite == null)
      throw new GraphQLError('UserTeamInvite not found.', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Manage, subject('UserTeamInvite', userTeamInvite))) {
      return await this.prismaService.userTeamInvite.update({
        where: {
          id
        },
        data: {
          removedAt: new Date()
        }
      })
    }
    throw new GraphQLError('user is not allowed to remove userTeamInvite', {
      extensions: { code: 'FORBIDDEN' }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard, CaslGuard)
  async userTeamInviteAcceptAll(
    @CurrentUser()
    user: User
  ): Promise<UserTeamInvite[]> {
    const userTeamInvites = await this.prismaService.userTeamInvite.findMany({
      where: {
        email: user.email,
        acceptedAt: null,
        removedAt: null
      }
    })

    const redeemedUserTeamInvites = await Promise.all(
      userTeamInvites.map(
        async (userTeamInvite) =>
          await this.redeemUserTeamInvite(userTeamInvite, user.id)
      )
    )
    return redeemedUserTeamInvites
  }

  private async redeemUserTeamInvite(
    userTeamInvite: UserTeamInvite,
    userId: string
  ): Promise<UserTeamInvite> {
    const [, redeemedUserTeamInvite] = await this.prismaService.$transaction([
      this.prismaService.userTeam.upsert({
        where: {
          teamId_userId: {
            teamId: userTeamInvite.teamId,
            userId
          }
        },
        create: {
          teamId: userTeamInvite.teamId,
          userId,
          role: UserTeamRole.member
        },
        update: {
          role: UserTeamRole.member
        }
      }),
      this.prismaService.userTeamInvite.update({
        where: {
          id: userTeamInvite.id
        },
        data: {
          acceptedAt: new Date(),
          receipientId: userId
        }
      })
    ])
    return redeemedUserTeamInvite
  }
}
