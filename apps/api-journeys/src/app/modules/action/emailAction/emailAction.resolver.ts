import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import includes from 'lodash/includes'
import { UserInputError } from 'apollo-server-errors'
import { object, string } from 'yup'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

import {
  Action,
  Block,
  EmailActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'

const emailActionSchema = object({
  email: string().required('Required').email()
})

@Resolver('EmailAction')
export class EmailActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async blockUpdateEmailAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: EmailActionInput
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
      throw new UserInputError('This block does not support email actions')
    }

    try {
      await emailActionSchema.validate({ email: input.email })
    } catch (err) {
      throw new UserInputError('must be a valid email')
    }
    const updatedBlock: { action: Action } = await this.blockService.update(
      id,
      {
        action: {
          ...input,
          parentBlockId: block.id,
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
