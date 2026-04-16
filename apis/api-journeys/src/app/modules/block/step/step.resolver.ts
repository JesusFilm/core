import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { Block } from '@core/prisma/journeys/client'

import { StepBlockPositionUpdateInput } from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { CaslAbility } from '../../../lib/CaslAuthModule'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('StepBlock')
export class StepBlockResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async stepBlockPositionUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: StepBlockPositionUpdateInput[]
  ): Promise<Block[]> {
    const blocks = await this.prismaService.block.findMany({
      where: { id: { in: input.map(({ id }) => id) } },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })
    if (blocks.length !== input.length)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    blocks.forEach((block) => {
      if (!ability.can(Action.Update, subject('Journey', block.journey)))
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
    })
    return await this.prismaService.$transaction(async (tx) => {
      await tx.journey.update({
        where: {
          id: blocks[0].journeyId
        },
        data: { updatedAt: new Date().toISOString() }
      })
      return await Promise.all(
        input.map(
          async (input) =>
            await tx.block.update({
              where: { id: input.id },
              data: { x: input.x, y: input.y }
            })
        )
      )
    })
  }

  @ResolveField()
  locked(@Parent() step: Block): boolean {
    if (step.locked != null) return step.locked

    return false
  }
}
