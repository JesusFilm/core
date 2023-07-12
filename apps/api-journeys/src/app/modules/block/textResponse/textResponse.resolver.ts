import { GraphQLError } from 'graphql'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { omit } from 'lodash'

import {
  Action,
  Role,
  TextResponseBlock,
  TextResponseBlockCreateInput,
  TextResponseBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('TextResponseBlock')
export class TextResponseBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  action(@Parent() block: TextResponseBlock): Action | null {
    if (block.action == null) return null

    return {
      ...block.action,
      parentBlockId: block.id
    }
  }

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async textResponseBlockCreate(
    @Args('input') input: TextResponseBlockCreateInput
  ): Promise<TextResponseBlock> {
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...omit(input, 'parentBlockId'),
      id: input.id ?? undefined,
      typename: 'TextResponseBlock',
      journey: { connect: { id: input.journeyId } },
      parentBlock: { connect: { id: input.parentBlockId } },
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async textResponseBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: TextResponseBlockUpdateInput
  ): Promise<TextResponseBlock> {
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

    return await this.blockService.update(id, input)
  }
}
