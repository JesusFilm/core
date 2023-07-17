import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import { Action } from '.prisma/api-journeys-client'
import includes from 'lodash/includes'
import omit from 'lodash/omit'

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
      throw new GraphQLError(
        'This block does not support navigate to block actions',
        { extensions: { code: 'BAD_USER_INPUT' } }
      )
    }

    const actionData = {
      ...omit(input, 'journeyId', 'blockId'),
      url: null,
      target: null,
      email: null,
      block: { connect: { id: input.blockId } }
    }
    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...actionData,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...actionData,
        journey: { disconnect: true }
      }
    })
  }
}
