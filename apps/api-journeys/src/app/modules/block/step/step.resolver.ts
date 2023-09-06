import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { Block } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  StepBlockCreateInput,
  StepBlockUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

@Resolver('StepBlock')
export class StepBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async stepBlockCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: StepBlockCreateInput
  ): Promise<Block> {
    const parentOrder = (await this.blockService.getSiblings(input.journeyId))
      .length
    return await this.prismaService.$transaction(async (tx) => {
      const block = await tx.block.create({
        data: {
          ...omit(input, 'journeyId', 'nextBlockId'),
          id: input.id ?? undefined,
          typename: 'StepBlock',
          journey: { connect: { id: input.journeyId } },
          nextBlock:
            input.nextBlockId != null
              ? { connect: { id: input.nextBlockId } }
              : undefined,
          parentOrder
        },
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
      if (!ability.can(Action.Update, subject('Journey', block.journey)))
        throw new GraphQLError('user is not allowed to create block', {
          extensions: { code: 'FORBIDDEN' }
        })
      return block
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async stepBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: StepBlockUpdateInput
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
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
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.blockService.update(id, input)
  }

  @ResolveField()
  locked(@Parent() step: Block): boolean {
    if (step.locked != null) return step.locked

    return false
  }
}
