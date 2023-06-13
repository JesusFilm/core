import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Action } from '.prisma/api-journeys-client'

import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  NavigateToBlockActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('NavigateToBlockAction')
export class NavigateToBlockActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async blockUpdateNavigateToBlockAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateToBlockActionInput
  ): Promise<Action> {
    const block = await this.prismaService.block.findUnique({where: {id}})

    if (block == null ||
      !includes(
        [
          'SignUpBlock',
          'RadioOptionBlock',
          'ButtonBlock',
          'VideoBlock',
          'VideoTriggerBlock',
          'TextResponseBlock'
        ],
        block.typename
      )
    ) {
      throw new UserInputError(
        'This block does not support navigate to block actions'
      )
    }

    return await this.prismaService.action.update({
      where: { id },
      data: {
          ...input,
          parentBlockId: block.id,
          journeyId: null,
          url: null,
          target: null,
          email: null
        }
      })
  }
}
