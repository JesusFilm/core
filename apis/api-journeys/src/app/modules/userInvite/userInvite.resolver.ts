import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { User } from '@core/nest/common/firebaseClient'
import { CurrentUser } from '@core/nest/decorators/CurrentUser'
import {
  Prisma,
  UserInvite,
  UserJourneyRole
} from '@core/prisma/journeys/client'

import { UserInviteCreateInput } from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { UserInviteService } from './userInvite.service'

@Resolver('UserInvite')
export class UserInviteResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userInviteService: UserInviteService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async userInvites(
    @CaslAccessible('UserInvite')
    accessibleUserInvites: Prisma.UserInviteWhereInput,
    @Args('journeyId')
    journeyId: string
  ): Promise<UserInvite[]> {
    return await this.prismaService.userInvite.findMany({
      where: {
        AND: [accessibleUserInvites, { journeyId }]
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userInviteCreate(
    @CaslAbility() ability: AppAbility,
    @CurrentUser() sender: User,
    @Args('journeyId') journeyId: string,
    @Args('input') input: UserInviteCreateInput
  ): Promise<UserInvite> {
    return await this.prismaService.$transaction(async (tx) => {
      const userInvite = await tx.userInvite.upsert({
        where: { journeyId_email: { journeyId, email: input.email } },
        create: {
          journey: { connect: { id: journeyId } },
          senderId: sender.id,
          email: input.email
        },
        update: {
          senderId: sender.id,
          acceptedAt: null,
          removedAt: null
        },
        include: {
          journey: {
            include: {
              team: {
                include: { userTeams: true }
              },
              userJourneys: true,
              primaryImageBlock: true
            }
          }
        }
      })
      if (!ability.can(Action.Create, subject('UserInvite', userInvite)))
        throw new GraphQLError('user is not allowed to create userInvite', {
          extensions: { code: 'FORBIDDEN' }
        })
      await this.userInviteService.sendEmail(
        userInvite.journey,
        input.email,
        omit(sender, ['id'])
      )
      return userInvite
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userInviteRemove(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<UserInvite> {
    const userInvite = await this.prismaService.userInvite.findUnique({
      where: { id },
      include: {
        journey: {
          include: {
            team: {
              include: { userTeams: true }
            },
            userJourneys: true
          }
        }
      }
    })
    if (userInvite == null)
      throw new GraphQLError('userInvite not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Manage, subject('UserInvite', userInvite)))
      throw new GraphQLError('user is not allowed to remove userInvite', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.userInvite.update({
      where: { id },
      data: {
        // Remove called on pending invites and on deleting userJourneys.
        // Both need to reset acceptedAt.
        acceptedAt: null,
        removedAt: new Date()
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userInviteAcceptAll(@CurrentUser() user: User): Promise<UserInvite[]> {
    if (user.email == null)
      throw new GraphQLError('User must have an email to accept invites', {
        extensions: { code: 'BAD_REQUEST' }
      })
    const userInvites = await this.prismaService.userInvite.findMany({
      where: {
        email: user.email,
        acceptedAt: null,
        removedAt: null
      }
    })
    const redeemedUserInvites = await Promise.all(
      userInvites.map(
        async (userInvite) => await this.redeemInvite(userInvite, user.id)
      )
    )
    return redeemedUserInvites
  }

  async redeemInvite(
    userInvite: UserInvite,
    userId: string
  ): Promise<UserInvite> {
    const [, redeemedUserInvite] = await this.prismaService.$transaction([
      this.prismaService.userJourney.upsert({
        where: {
          journeyId_userId: {
            journeyId: userInvite.journeyId,
            userId
          }
        },
        create: {
          journey: { connect: { id: userInvite.journeyId } },
          userId,
          role: UserJourneyRole.editor
        },
        update: {
          role: UserJourneyRole.editor
        }
      }),
      this.prismaService.userInvite.update({
        where: {
          id: userInvite.id
        },
        data: {
          acceptedAt: new Date()
        }
      })
    ])
    return redeemedUserInvite
  }
}
