import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { EmailPreferences } from '.prisma/api-users-client'

import { EmailPreferencesUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('EmailPreferences')
export class EmailPreferencesResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async emailPreferences(): Promise<EmailPreferences[]> {
    const result = await this.prismaService.emailPreferences.findMany()
    return result
  }

  @Query()
  async emailPreference(
    @Args('id') id: string,
    @Args('idType') idType: string
  ): Promise<EmailPreferences> {
    const result = await this.prismaService.emailPreferences.findFirst({
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
  async updateEmailPreferences(
    @Args('input') input: EmailPreferencesUpdateInput
  ): Promise<EmailPreferences> {
    const { id, ...data } = input
    const result = await this.prismaService.emailPreferences.update({
      where: { id },
      data
    })
    return result
  }

  @Mutation()
  async findOrCreateEmailPreference(
    @Args('email') email: string
  ): Promise<EmailPreferences> {
    let emailPreference = await this.prismaService.emailPreferences.findFirst({
      where: {
        userEmail: email
      }
    })

    console.log('emailPreference', emailPreference)

    if (emailPreference == null) {
      emailPreference = await this.prismaService.emailPreferences.create({
        data: {
          userEmail: email
        }
      })
      const user = await this.prismaService.user.findFirst({
        where: {
          email
        }
      })

      if (user != null) {
        await this.prismaService.user.update({
          where: { id: user.id },
          data: { emailPreferencesId: emailPreference.id }
        })
      }
    }

    return emailPreference
  }

  @Mutation()
  async createEmailPreferencesForAllUsers(): Promise<boolean> {
    const users = await this.prismaService.user.findMany({
      where: { emailPreferencesId: null }
    })

    for (const user of users) {
      await this.findOrCreateEmailPreference(user.email)
    }

    return true
  }
}
