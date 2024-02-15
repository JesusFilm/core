import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { JourneysEmailPreference } from '.prisma/api-journeys-client'

import { JourneysEmailPreferenceUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('JourneysEmailPreference')
export class JourneysEmailPreferenceResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  async updateJourneysEmailPreference(
    @Args('input') input: JourneysEmailPreferenceUpdateInput
  ): Promise<JourneysEmailPreference> {
    const { email, ...rest } = input
    const journeysEmailPreference =
      await this.prismaService.journeysEmailPreference.findUnique({
        where: { email }
      })

    console.log('journeysEmailPreference', journeysEmailPreference)
    console.log('rest', rest)

    const updatedJourneysEmailPreference =
      await this.prismaService.journeysEmailPreference.update({
        where: { email },
        data: input
      })

    console.log(
      'updatedJourneysEmailPreference',
      updatedJourneysEmailPreference
    )

    return updatedJourneysEmailPreference
  }

  @Mutation()
  async findOrCreateJourneysEmailPreference(
    @Args('email') email: string
  ): Promise<JourneysEmailPreference> {
    let result: JourneysEmailPreference | null = null

    try {
      result = await this.prismaService.journeysEmailPreference.findUnique({
        where: { email }
      })

      if (result === null) {
        result = await this.prismaService.journeysEmailPreference.create({
          data: {
            email,
            unsubscribeAll: false,
            accountNotifications: true
          }
        })
      }
    } catch (error) {
      console.error('Error in findOrCreateJourneysEmailPreference:', error)
      throw new GraphQLError('Error in findOrCreateJourneysEmailPreference')
    }

    return result
  }
}
