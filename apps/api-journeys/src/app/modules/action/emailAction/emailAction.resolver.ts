import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { GraphQLError } from 'graphql'
import { object, string } from 'yup'
import { Action } from '.prisma/api-journeys-client'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  EmailActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

const emailActionSchema = object({
  email: string().required('Required').email()
})

@Resolver('EmailAction')
export class EmailActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

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

    const actionData = {
      ...input,
      url: null,
      target: null
    }
    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: { ...actionData, parentBlock: { connect: { id: block.id } } },
      update: {
        ...actionData,
        journey: { disconnect: true },
        block: { disconnect: true }
      }
    })
  }
}
