import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

import {
  Action,
  Block,
  LinkActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'

@Resolver('LinkAction')
export class LinkActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async blockUpdateLinkAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: LinkActionInput
  ): Promise<Action> {
    const block = (await this.blockService.get(id)) as Block & {
      __typename: string
    }

    if (
      !includes(
        [
          'SignUpBlock',
          'RadioOptionBlock',
          'ButtonBlock',
          'VideoBlock',
          'VideoTriggerBlock',
          'TextResponseBlock'
        ],
        block.__typename
      )
    ) {
      throw new UserInputError('This block does not support link actions')
    }

    const updatedBlock: { action: Action } = await this.blockService.update(
      id,
      {
        action: {
          ...input,
          parentBlockId: block.id,
          blockId: null,
          journeyId: null,
          email: null
        }
      }
    )

    return updatedBlock.action
  }
}
