import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Block } from '@core/prisma/journeys/client'

import {
  TextResponseBlockCreateInput,
  TextResponseBlockUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

@Resolver('TextResponseBlock')
export class TextResponseBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async textResponseBlockCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: TextResponseBlockCreateInput
  ): Promise<Block> {
    const parentOrder = (
      await this.blockService.getSiblings(input.journeyId, input.parentBlockId)
    ).length

    return await this.prismaService.$transaction(async (tx) => {
      const block = await tx.block.create({
        data: {
          ...omit(input, 'parentBlockId', 'journeyId'),
          id: input.id ?? undefined,
          typename: 'TextResponseBlock',
          journey: { connect: { id: input.journeyId } },
          parentBlock: { connect: { id: input.parentBlockId } },
          parentOrder
        },
        include: {
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })
      await this.blockService.setJourneyUpdatedAt(tx, block)
      if (!ability.can(Action.Update, subject('Journey', block.journey)))
        throw new GraphQLError('user is not allowed to create block', {
          extensions: { code: 'FORBIDDEN' }
        })
      return block
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async textResponseBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: TextResponseBlockUpdateInput
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
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

    if (
      input.routeId != null &&
      block.integrationId == null &&
      input.integrationId == null
    )
      throw new GraphQLError(
        'route is being set but it is not associated to an integration',
        {
          extensions: { code: 'BAD_USER_INPUT' }
        }
      )

    return await this.blockService.update(id, {
      ...input
    })
  }
}
