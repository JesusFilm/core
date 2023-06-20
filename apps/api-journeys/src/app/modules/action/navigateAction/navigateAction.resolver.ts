import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Action } from '.prisma/api-journeys-client'

import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  NavigateActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('NavigateAction')
export class NavigateActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async blockUpdateNavigateAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateActionInput
  ): Promise<Action> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: { action: true }
    })

    if (
      block == null ||
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
      throw new UserInputError('This block does not support navigate actions')
    }

    const actionData = {
      ...input,
      parentBlockId: block.id,
      blockId: null,
      journeyId: null,
      url: null,
      target: null,
      email: null
    }
    return await this.prismaService.action.upsert({
      where: { id },
      create: { ...actionData, block: { connect: { id: block.id } } },
      update: actionData
    })
  }
}
