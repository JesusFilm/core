import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import { Action } from '.prisma/api-journeys-client'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import includes from 'lodash/includes'

import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  LinkActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('LinkAction')
export class LinkActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  @FromPostgresql()
  async blockUpdateLinkAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: LinkActionInput
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
      throw new GraphQLError('This block does not support link actions', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    const actionData = {
      ...input,
      email: null
    }
    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...actionData,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...actionData,
        journey: { disconnect: true },
        block: { disconnect: true }
      }
    })
  }
}
