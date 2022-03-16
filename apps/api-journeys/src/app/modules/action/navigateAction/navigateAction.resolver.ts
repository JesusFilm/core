import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  NavigateActionInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'

@Resolver('NavigateAction')
export class NavigateActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async blockUpdateNavigateAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateActionInput
  ): Promise<Action> {
    const block = await this.blockService.get<{
      __typename: string
      _key: string
    }>(id)

    if (
      !includes(
        ['SignUpBlock', 'RadioOptionBlock', 'ButtonBlock', 'VideoTriggerBlock'],
        block.__typename
      )
    ) {
      throw new UserInputError('This block does not support navigate actions')
    }

    const updatedBlock: { action: Action } = await this.blockService.update(
      id,
      {
        action: {
          ...input,
          parentBlockId: block._key,
          blockId: null,
          journeyId: null,
          url: null,
          target: null
        }
      }
    )

    return updatedBlock.action
  }
}
