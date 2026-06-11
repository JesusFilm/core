import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { Block } from '@core/prisma/journeys/client'

import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { CaslAbility } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { INCLUDE_JOURNEY_ACL } from '../journey/journey.acl'
import { JourneyCustomizableService } from '../journey/journeyCustomizable.service'

import { BlockService, BlockWithAction } from './block.service'

@Resolver('Block')
export class BlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService,
    private readonly journeyCustomizableService: JourneyCustomizableService
  ) {}

  @ResolveField()
  __resolveType(obj: { __typename?: string; typename: string }): string {
    return obj.__typename ?? obj.typename
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockRestore(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        action: true,
        ...INCLUDE_JOURNEY_ACL
      }
    })

    if (block == null) {
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })

    const result = await this.prismaService.$transaction(async (tx) => {
      const updatedBlock = await tx.block.update({
        where: { id },
        data: {
          deletedAt: null
        },
        include: {
          action: true
        }
      })
      let siblings: BlockWithAction[] = [updatedBlock]
      if (updatedBlock?.parentOrder != null)
        siblings = await this.blockService.reorderBlock(
          updatedBlock,
          updatedBlock.parentOrder,
          tx
        )

      const blocks = await tx.block.findMany({
        where: {
          journeyId: updatedBlock.journeyId,
          deletedAt: null,
          NOT: { id: updatedBlock.id }
        },
        include: { action: true }
      })

      const children: Block[] = await this.blockService.getDescendants(
        updatedBlock.id,
        blocks
      )

      await tx.journey.update({
        where: {
          id: updatedBlock.journeyId
        },
        data: { updatedAt: new Date().toISOString() }
      })
      return {
        blocks: [...siblings, ...children],
        journeyId: updatedBlock.journeyId
      }
    })
    await this.journeyCustomizableService.recalculate(result.journeyId)
    return result.blocks
  }
}
