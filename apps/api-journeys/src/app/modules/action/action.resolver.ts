import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators'
import { get, includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { Action, Block, UserJourneyRole } from '../../__generated__/graphql'
import { BlockService } from '../block/block.service'

@Resolver('Action')
export class ActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  __resolveType(obj: Action): string {
    if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
    if (get(obj, 'journeyId') != null) return 'NavigateToJourneyAction'
    if (get(obj, 'url') != null) return 'LinkAction'
    return 'NavigateAction'
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async blockDeleteAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string
  ): Promise<Block> {
    const block = await this.blockService.get<{ __typename: string }>(id)

    if (
      !includes(
        ['SignUpBlock', 'RadioOptionBlock', 'ButtonBlock', 'VideoTriggerBlock'],
        block.__typename
      )
    ) {
      throw new UserInputError('This block does not support actions')
    }

    return await this.blockService.update(id, {
      action: null
    })
  }
}
