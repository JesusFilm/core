import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { get, includes } from 'lodash'
import { GraphQLError } from 'graphql'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'

import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import {
  Action,
  Block,
  Role,
  UserJourneyRole
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Action')
export class ActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField()
  __resolveType(obj: Action): string {
    if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
    if (get(obj, 'journeyId') != null) return 'NavigateToJourneyAction'
    if (get(obj, 'url') != null) return 'LinkAction'
    if (get(obj, 'email') != null) return 'EmailAction'
    return 'NavigateAction'
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  @FromPostgresql()
  async blockDeleteAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string
  ): Promise<Block> {
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
          'VideoTriggerBlock'
        ],
        block.typename
      )
    ) {
      throw new GraphQLError('This block does not support actions', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    await this.prismaService.action.delete({ where: { parentBlockId: id } })
    return block
  }
}
