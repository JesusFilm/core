import { UserInputError } from 'apollo-server-errors'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import {
  Action,
  TextFieldBlock,
  TextFieldBlockCreateInput,
  TextFieldBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('TextFieldBlock')
export class TextFieldBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  action(@Parent() block: TextFieldBlock): Action | null {
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
      UserJourneyRole.editor
    ])
  )
  async textFieldBlockCreate(
    @Args('input') input: TextFieldBlockCreateInput & { __typename }
  ): Promise<TextFieldBlock> {
    input.__typename = 'TextFieldBlock'
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...input,
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async textFieldBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: TextFieldBlockUpdateInput
  ): Promise<TextFieldBlock> {
    if (input.submitIconId != null) {
      const submitIcon = await this.blockService.validateBlock(
        input.submitIconId,
        id
      )
      if (!submitIcon) {
        throw new UserInputError('Submit icon does not exist')
      }
    }

    return await this.blockService.update(id, input)
  }
}
