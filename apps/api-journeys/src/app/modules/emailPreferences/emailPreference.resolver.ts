import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { EmailPreference } from '.prisma/api-journeys-client'

import { EmailPreferenceUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('EmailPreference')
export class EmailPreferenceResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async emailPreferences(): Promise<EmailPreference[]> {
    console.log('HERE IN QUERY')
    const result = await this.prismaService.emailPreference.findMany()
    return result
  }

  @Query()
  async emailPreference(
    @Args('id') id: string,
    @Args('idType') idType: string
  ): Promise<EmailPreference> {
    const result = await this.prismaService.emailPreference.findFirst({
      where: {
        [idType]: id
      }
    })
    if (result == null)
      throw new GraphQLError('Email Prefrences not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    return result
  }

  @Mutation()
  async updateEmailPreference(
    @Args('input') input: EmailPreferenceUpdateInput
  ): Promise<EmailPreference> {
    const { email, ...rest } = input
    await this.prismaService.emailPreference.findUnique({
      where: { email }
    })
    return this.prismaService.emailPreference.update({
      where: { email },
      data: rest
    })
  }

  @Mutation()
  async findOrCreateEmailPreference(
    @Args('email') email: string
  ): Promise<EmailPreference> {
    console.log('HERE IN THE MUTATION')
    try {
      const result = await this.prismaService.emailPreference.findUnique({
        where: { email }
      })
      if (result != null) return result
      return this.prismaService.emailPreference.create({
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
    } catch (error) {
      console.error('Error in findOrCreateEmailPreference:', error)
      throw error
    }
  }
}
