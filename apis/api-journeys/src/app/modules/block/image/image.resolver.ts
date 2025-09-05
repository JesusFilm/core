import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Block } from '@core/prisma/journeys/client'

import {
  ImageBlockCreateInput,
  ImageBlockUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { INCLUDE_JOURNEY_ACL } from '../../journey/journey.acl'
import { BlockService } from '../block.service'

import { transformInput } from './transformInput'

@Resolver('ImageBlock')
export class ImageBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async imageBlockCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: ImageBlockCreateInput
  ): Promise<Block> {
    const transformedInput = await transformInput(input)

    return await this.prismaService.$transaction(async (tx) => {
      if (transformedInput.isCover === true) {
        if (transformedInput.parentBlockId == null)
          throw new GraphQLError(
            'parent block id is required for cover blocks',
            {
              extensions: { code: 'BAD_USER_INPUT' }
            }
          )
        const parentBlock = await tx.block.findUnique({
          where: {
            id: transformedInput.parentBlockId
          },
          include: { coverBlock: true }
        })
        if (parentBlock == null)
          throw new GraphQLError('parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        // Delete old coverBlock
        if (parentBlock.coverBlock != null)
          await this.blockService.removeBlockAndChildren(parentBlock.coverBlock)
      }

      const block = await tx.block.create({
        data: {
          ...omit(transformedInput, 'parentBlockId', 'journeyId', 'isCover'),
          id: transformedInput.id ?? undefined,
          typename: 'ImageBlock',
          journey: { connect: { id: transformedInput.journeyId } },
          // parentBlockId can be null for image blocks being used as journey
          // social media image
          parentBlock:
            transformedInput.parentBlockId != null
              ? { connect: { id: transformedInput.parentBlockId } }
              : undefined,
          parentOrder:
            transformedInput.isCover === true
              ? null
              : (
                  await this.blockService.getSiblings(
                    transformedInput.journeyId,
                    transformedInput.parentBlockId
                  )
                ).length,
          coverBlockParent:
            transformedInput.isCover === true &&
            transformedInput.parentBlockId != null
              ? { connect: { id: transformedInput.parentBlockId } }
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
  async imageBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: ImageBlockUpdateInput
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
      ...(await transformInput(input))
    })
  }
}
