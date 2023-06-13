import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
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
    const block = await this.prismaService.block.findUnique({ where: { id } })

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
      throw new UserInputError('This block does not support email actions')
    }

    try {
      await emailActionSchema.validate({ email: input.email })
    } catch (err) {
      throw new UserInputError('must be a valid email')
    }

    return await this.prismaService.action.update({
      where: { id },
      data: {
        ...input,
        parentBlockId: block.id,
        blockId: null,
        journeyId: null,
        url: null,
        target: null
      }
    })
  }
}
