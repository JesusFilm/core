import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Block, Prisma } from '@core/prisma-journeys/client'

import {
  IconBlockCreateInput,
  IconBlockUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { sanitizeClassNames } from '../../../lib/tailwind/sanitizeClassNames'
import { INCLUDE_JOURNEY_ACL } from '../../journey/journey.acl'
import { BlockService } from '../block.service'

@Resolver('IconBlock')
export class IconBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async iconBlockCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: IconBlockCreateInput
  ): Promise<Block> {
    return await this.prismaService.$transaction(async (tx) => {
      const block = await tx.block.create({
        data: {
          ...omit(input, 'parentBlockId', 'journeyId'),
          id: input.id ?? undefined,
          typename: 'IconBlock',
          journey: { connect: { id: input.journeyId } },
          parentBlock: { connect: { id: input.parentBlockId } },
          // Icons positions are set via parent block props, cannot be ordered.
          parentOrder: null,
          classNames:
            input.classNames != null
              ? sanitizeClassNames(
                  input.classNames as unknown as Prisma.JsonObject,
                  { self: '' }
                )
              : undefined
        },
        include: {
          action: true,
          ...INCLUDE_JOURNEY_ACL
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
  async iconBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: IconBlockUpdateInput
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
    return await this.blockService.update(id, {
      ...input,
      classNames:
        input.classNames != null
          ? sanitizeClassNames(
              input.classNames as unknown as Prisma.JsonObject,
              block.classNames as Prisma.JsonObject
            )
          : undefined
    })
  }
}
