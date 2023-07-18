import { GraphQLError } from 'graphql'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver, Parent } from '@nestjs/graphql'
import omit from 'lodash/omit'

import {
  Action,
  ButtonBlock,
  ButtonBlockCreateInput,
  ButtonBlockUpdateInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('ButtonBlock')
export class ButtonBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  action(@Parent() block: ButtonBlock): Action | null {
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
  async buttonBlockCreate(
    @Args('input') input: ButtonBlockCreateInput
  ): Promise<ButtonBlock> {
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...omit(input, 'parentBlockId'),
      id: input.id ?? undefined,
      typename: 'ButtonBlock',
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
  async buttonBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: ButtonBlockUpdateInput
  ): Promise<ButtonBlock> {
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

    return await this.blockService.update(id, input)
  }
}
