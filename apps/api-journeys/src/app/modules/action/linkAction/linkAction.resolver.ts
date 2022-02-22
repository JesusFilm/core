import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

import {
  Action,
  LinkActionInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'

@Resolver('LinkAction')
export class LinkActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async blockUpdateLinkAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: LinkActionInput
  ): Promise<Action> {
    const block = await this.blockService.get<{ __typename: string }>(id)

    if (
      !includes(
        ['SignUpBlock', 'RadioOptionBlock', 'ButtonBlock', 'VideoTriggerBlock'],
        block.__typename
      )
    ) {
      throw new UserInputError('This block does not support link actions')
    }

    return await this.blockService.update(id, {
      action: { ...input, blockId: null, journeyId: null }
    })
  }
}
