import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

// import { emailPreference } from '.prisma/api-users-client'

// import { emailPreferenceUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('emailPreference')
export class EmailPreferenceResolver {
  constructor(private readonly prismaService: PrismaService) {}

  // @Query()
  // async emailPreferences(): Promise<emailPreference[]> {
  //   const result = await this.prismaService.emailPreference.findMany()
  //   return result
  // }

  // @Query()
  // async emailPreference(
  //   @Args('id') id: string,
  //   @Args('idType') idType: string
  // ): Promise<emailPreference> {
  //   const result = await this.prismaService.emailPreference.findFirst({
  //     where: {
  //       [idType]: id
  //     }
  //   })
  //   if (result == null)
  //     throw new GraphQLError('Email Prefrences not found', {
  //       extensions: { code: 'NOT_FOUND' }
  //     })

  //   return result
  // }

  // @Mutation()
  // async updateemailPreference(
  //   @Args('input') input: emailPreferenceUpdateInput
  // ): Promise<emailPreference> {
  //   const { id, ...data } = input
  //   const result = await this.prismaService.emailPreference.update({
  //     where: { id },
  //     data
  //   })
  //   return result
  // }

  // @Mutation()
  // async findOrCreateEmailPreference(
  //   @Args('email') email: string
  // ): Promise<emailPreference> {
  //   let emailPreference = await this.prismaService.emailPreference.findFirst({
  //     where: {
  //       userEmail: email
  //     }
  //   })

  //   if (emailPreference == null) {
  //     emailPreference = await this.prismaService.emailPreference.create({
  //       data: {
  //         userEmail: email
  //       }
  //     })
  //     const user = await this.prismaService.user.findFirst({
  //       where: {
  //         email
  //       }
  //     })

  //     if (user != null) {
  //       await this.prismaService.user.update({
  //         where: { id: user.id },
  //         data: { emailPreferenceId: emailPreference.id }
  //       })
  //     }
  //   }

  //   return emailPreference
  // }

  // @Mutation()
  // async createemailPreferenceForAllUsers(): Promise<boolean> {
  //   const users = await this.prismaService.user.findMany({
  //     where: { emailPreferenceId: null }
  //   })

  //   for (const user of users) {
  //     await this.findOrCreateEmailPreference(user.email)
  //   }

  //   return true
  // }
}
