import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { Block, Prisma } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  SignUpBlockCreateInput,
  SignUpBlockUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { sanitizeClassNames } from '../../../lib/tailwind/sanitizeClassNames'
import { INCLUDE_JOURNEY_ACL } from '../../journey/journey.acl'
import { BlockService } from '../block.service'

@Resolver('SignUpBlock')
export class SignUpBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async signUpBlockCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: SignUpBlockCreateInput
  ): Promise<Block> {
    const parentOrder = (
      await this.blockService.getSiblings(input.journeyId, input.parentBlockId)
    ).length

    return await this.prismaService.$transaction(async (tx) => {
      const block = await tx.block.create({
        data: {
          ...omit(input, 'parentBlockId', 'journeyId'),
          id: input.id ?? undefined,
          typename: 'SignUpBlock',
          journey: { connect: { id: input.journeyId } },
          parentBlock: { connect: { id: input.parentBlockId } },
          parentOrder,
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
  async signUpBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: SignUpBlockUpdateInput
  ): Promise<Block> {
    if (input.submitIconId != null) {
      const submitIcon = await this.blockService.validateBlock(
        input.submitIconId,
        id
      )
      if (!submitIcon) {
        throw new GraphQLError('Submit icon does not exist', {
          extensions: { code: 'NOT_FOUND' }
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
