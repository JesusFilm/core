import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import get from 'lodash/get'
import { z } from 'zod'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { BlockUpdateActionInput } from '../../__generated__/graphql'
import { AppAbility, Action as CaslAction } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'
import { ActionService } from './action.service'
import { canBlockHaveAction } from './canBlockHaveAction'
import { Action, Block } from '.prisma/api-journeys-client'

const linkActionInputSchema = z.object({
  gtmEventName: z.string().nullable(),
  url: z.string(),
  target: z.string().nullable()
})

const emailActionInputSchema = z.object({
  gtmEventName: z.string().nullable(),
  email: z.string().email()
})

const navigateToBlockActionInputSchema = z.object({
  gtmEventName: z.string().nullable(),
  blockId: z.string()
})

@Resolver('Action')
export class ActionResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly actionService: ActionService
  ) {}

  @ResolveField()
  __resolveType(obj: Action): string {
    if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
    if (get(obj, 'email') != null) return 'EmailAction'
    return 'LinkAction'
  }

  @ResolveField('parentBlock')
  async parentBlock(
    @Parent() action: Action & { parentBlock?: Block }
  ): Promise<Block | null> {
    if (action.parentBlock != null) return action.parentBlock

    return await this.prismaService.block.findUnique({
      where: { id: action.parentBlockId }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  @FromPostgresql()
  async blockDeleteAction(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        action: true,
        journey: {
          include: {
            userJourneys: true,
            team: {
              include: { userTeams: true }
            }
          }
        }
      }
    })
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(CaslAction.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    if (block == null || !canBlockHaveAction(block)) {
      throw new GraphQLError('This block does not support actions', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    await this.prismaService.action.delete({ where: { parentBlockId: id } })
    return block
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockUpdateAction(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: BlockUpdateActionInput
  ): Promise<Action> {
    const { success: isLink, data: linkInput } =
      linkActionInputSchema.safeParse(input)
    const { success: isEmail, data: emailInput } =
      emailActionInputSchema.safeParse(input)
    const { success: isNavigateToBlock, data: navigateToBlockInput } =
      navigateToBlockActionInputSchema.safeParse(input)

    const numberOfValidInputs = [isLink, isEmail, isNavigateToBlock].reduce(
      (acc, val) => (!val ? acc : acc + 1),
      0
    )
    if (numberOfValidInputs > 1) {
      throw new GraphQLError('invalid combination of inputs provided', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }
    if (numberOfValidInputs === 0) {
      throw new GraphQLError('no valid inputs provided', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        action: true,
        journey: {
          include: {
            userJourneys: true,
            team: {
              include: { userTeams: true }
            }
          }
        }
      }
    })
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(CaslAction.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    if (block == null || !canBlockHaveAction(block)) {
      throw new GraphQLError('This block does not support actions', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    if (isEmail) {
      return await this.actionService.emailActionUpdate(id, block, emailInput)
    }
    if (isNavigateToBlock) {
      return await this.actionService.navigateToBlockActionUpdate(
        id,
        block,
        navigateToBlockInput
      )
    }
    if (isLink) {
      return await this.actionService.linkActionUpdate(id, block, linkInput)
    }
    throw new GraphQLError('no inputs provided', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }
}
