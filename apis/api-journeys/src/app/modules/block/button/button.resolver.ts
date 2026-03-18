import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { Block, Prisma } from '@core/prisma/journeys/client'

import { ButtonBlockUpdateInput } from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { CaslAbility } from '../../../lib/CaslAuthModule'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

@Resolver('ButtonBlock')
export class ButtonBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async buttonBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: ButtonBlockUpdateInput
  ): Promise<Block> {
    if (input.startIconId != null) {
      const startIcon = await this.blockService.validateBlock(
        input.startIconId,
        id
      )
      if (!startIcon) {
        throw new GraphQLError('Start icon does not exist', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
    }
    if (input.endIconId != null) {
      const endIcon = await this.blockService.validateBlock(input.endIconId, id)
      if (!endIcon) {
        throw new GraphQLError('End icon does not exist', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
    }
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
    return await this.blockService.update(id, {
      ...input,
      settings:
        input.settings != null
          ? {
              ...((block.settings ?? {}) as Prisma.JsonObject),
              ...(input.settings as Prisma.JsonObject)
            }
          : undefined
    })
  }
}
