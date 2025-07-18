import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { JourneyTheme } from '@core/prisma-journeys/client'

import {
  JourneyThemeCreateInput,
  JourneyThemeUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('JourneyTheme')
export class JourneyThemeResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async journeyTheme(
    @Args('journeyId') journeyId: string
  ): Promise<JourneyTheme | null> {
    const journeyTheme = await this.prismaService.journeyTheme.findUnique({
      where: { journeyId },
      include: {
        journey: true
      }
    })
    if (journeyTheme == null) {
      throw new GraphQLError('journey theme not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    return journeyTheme
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyThemeCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: JourneyThemeCreateInput,
    @CurrentUserId() userId: string
  ): Promise<JourneyTheme> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id: input.journeyId },
      include: {
        userJourneys: true,
        team: { include: { userTeams: true } }
      }
    })

    if (journey == null) {
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    if (!ability.can(Action.Update, subject('Journey', journey))) {
      throw new GraphQLError('user is not allowed to create journey theme', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    return await this.prismaService.$transaction(async (tx) => {
      const existingTheme = await tx.journeyTheme.findUnique({
        where: { journeyId: input.journeyId }
      })

      if (existingTheme != null) {
        throw new GraphQLError('journey already has a theme', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      return await tx.journeyTheme.create({
        data: {
          journeyId: input.journeyId,
          userId,
          headerFont: input.headerFont ?? null,
          bodyFont: input.bodyFont ?? null,
          labelFont: input.labelFont ?? null
        }
      })
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyThemeUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: JourneyThemeUpdateInput
  ): Promise<JourneyTheme> {
    const journeyTheme = await this.prismaService.journeyTheme.findUnique({
      where: { id },
      include: {
        journey: {
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        }
      }
    })

    if (journeyTheme == null) {
      throw new GraphQLError('journey theme not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    if (!ability.can(Action.Update, subject('JourneyTheme', journeyTheme))) {
      throw new GraphQLError('user is not allowed to update journey theme', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    return await this.prismaService.journeyTheme.update({
      where: { id },
      data: {
        headerFont: input.headerFont ?? undefined,
        bodyFont: input.bodyFont ?? undefined,
        labelFont: input.labelFont ?? undefined
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyThemeDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<JourneyTheme> {
    const journeyTheme = await this.prismaService.journeyTheme.findUnique({
      where: { id },
      include: {
        journey: {
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        }
      }
    })

    if (journeyTheme == null) {
      throw new GraphQLError('journey theme not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    if (!ability.can(Action.Delete, subject('JourneyTheme', journeyTheme))) {
      throw new GraphQLError('user is not allowed to delete journey theme', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    return await this.prismaService.journeyTheme.delete({
      where: { id }
    })
  }
}
