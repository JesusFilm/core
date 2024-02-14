import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { EmailPreference } from '.prisma/api-journeys-client'

import { EmailPreferenceUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('EmailPreference')
export class EmailPreferenceResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  async updateEmailPreference(
    @Args('input') input: EmailPreferenceUpdateInput
  ): Promise<EmailPreference> {
    const { email, ...rest } = input
    const emailPreference = await this.prismaService.emailPreference.findUnique(
      {
        where: { email }
      }
    )

    console.log('emailPreference', emailPreference)
    console.log('rest', rest)

    const updatedEmailPreference =
      await this.prismaService.emailPreference.update({
        where: { email },
        data: input
      })

    console.log('updatedEmailPreference', updatedEmailPreference)

    return updatedEmailPreference
  }

  @Mutation()
  async findOrCreateEmailPreference(
    @Args('email') email: string
  ): Promise<EmailPreference> {
    let result: EmailPreference | null = null

    try {
      result = await this.prismaService.emailPreference.findUnique({
        where: { email }
      })

      if (result === null) {
        result = await this.prismaService.emailPreference.create({
          data: {
            email,
            unsubscribeAll: false,
            teamInvite: true,
            teamRemoved: true,
            teamInviteAccepted: true,
            journeyEditInvite: true,
            journeyRequestApproved: true,
            journeyAccessRequest: true
          }
        })
      }
    } catch (error) {
      console.error('Error in findOrCreateEmailPreference:', error)
      throw new GraphQLError('Error in findOrCreateEmailPreference')
    }

    return result
  }
}
