import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  NavigateToBlockActionInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'

@Resolver('NavigateToBlockActionResolver')
export class NavigateToBlockActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async blockUpdateNavigateToBlockAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateToBlockActionInput
  ): Promise<Action> {
    const block = await this.blockService.get<{ __typename: string }>(id)

    if (
      !includes(
        ['SignUpBlock', 'RadioOptionBlock', 'ButtonBlock', 'VideoTriggerBlock'],
        block.__typename
      )
    ) {
      throw new UserInputError(
        'This block does not support navigate to block actions'
      )
    }

    return await this.blockService.update(id, {
      action: { ...input, journeyId: null, url: null, target: null }
    })
  }
}
