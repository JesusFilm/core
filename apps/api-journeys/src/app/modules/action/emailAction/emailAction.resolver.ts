import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { object, string } from 'yup'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Action } from '.prisma/api-journeys-client'

import { EmailActionInput } from '../../../__generated__/graphql'
import { AppAbility, Action as CaslAction } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { ACTION_UPDATE_RESET } from '../actionUpdateReset'
import { canBlockHaveAction } from '../canBlockHaveAction'

const emailActionSchema = object({
  email: string().required('Required').email()
})

@Resolver('EmailAction')
export class EmailActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockUpdateEmailAction(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: EmailActionInput
  ): Promise<Action> {
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
    if (block == null || !canBlockHaveAction(block)) {
      throw new GraphQLError('This block does not support email actions', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    try {
      await emailActionSchema.validate({ email: input.email })
    } catch (err) {
      throw new GraphQLError('must be a valid email', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...input,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...ACTION_UPDATE_RESET,
        ...input
      },
      include: { parentBlock: { include: { action: true } } }
    })
  }
}
