import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import get from 'lodash/get'
import includes from 'lodash/includes'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { subject } from '@casl/ability'
import { Action, Block } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { Action as CaslAction, AppAbility } from '../../lib/casl/caslFactory'

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
  @UseGuards(AppCaslGuard)
  @FromPostgresql()
  async blockDeleteAction(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        action: true,
        journey: {
          include: {
            userJourneys: true,
            team: {
              include: { userTeams: true }
            }
          }
        }
      }
    })
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(CaslAction.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
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
