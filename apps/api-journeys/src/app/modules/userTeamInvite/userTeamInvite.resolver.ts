import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { Prisma, UserTeamInvite } from '.prisma/api-journeys-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { User } from '@core/nest/common/firebaseClient'
import { CurrentUser } from '@core/nest/decorators/CurrentUser'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import {
  UserTeamInviteCreateInput,
  UserTeamRole
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { UserTeamInviteService } from './userTeamInvite.service'

@Resolver('userTeamInvite')
export class UserTeamInviteResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userTeamInviteService: UserTeamInviteService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
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
  @UseGuards(AppCaslGuard)
  async userTeamInviteCreate(
    @CaslAbility() ability: AppAbility,
    @CurrentUserId() senderId: string,
    @Args('teamId') teamId: string,
    @Args('input') input: UserTeamInviteCreateInput
  ): Promise<UserTeamInvite> {
    return await this.prismaService.$transaction(async (tx) => {
      const userTeamInvite = await tx.userTeamInvite.upsert({
        where: {
          teamId_email: {
            teamId,
            email: input.email
          }
        },
        create: {
          email: input.email,
          senderId,
          team: { connect: { id: teamId } }
        },
        update: {
          senderId,
          acceptedAt: null,
          receipientId: null,
          removedAt: null
        },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })
      if (
        !ability.can(Action.Create, subject('UserTeamInvite', userTeamInvite))
      )
        throw new GraphQLError('user is not allowed to create userTeamInvite', {
          extensions: { code: 'FORBIDDEN' }
        })
      await this.userTeamInviteService.sendEmail(
        userTeamInvite.team,
        input.email
      )
      return userTeamInvite
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userTeamInviteRemove(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<UserTeamInvite> {
    const userTeamInvite = await this.prismaService.userTeamInvite.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (userTeamInvite == null)
      throw new GraphQLError('userTeamInvite not found.', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Manage, subject('UserTeamInvite', userTeamInvite)))
      throw new GraphQLError('user is not allowed to remove userTeamInvite', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.userTeamInvite.update({
      where: {
        id
      },
      data: {
        removedAt: new Date()
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
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
          team: { connect: { id: userTeamInvite.teamId } },
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
