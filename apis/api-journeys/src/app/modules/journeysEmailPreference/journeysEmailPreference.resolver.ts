import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { JourneysEmailPreference } from '@core/prisma/journeys/client'

import { JourneysEmailPreferenceUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('JourneysEmailPreference')
export class JourneysEmailPreferenceResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  async updateJourneysEmailPreference(
    @Args('input') input: JourneysEmailPreferenceUpdateInput
  ): Promise<JourneysEmailPreference> {
    const { email, preference, value } = input

    const updatedJourneysEmailPreference =
      await this.prismaService.journeysEmailPreference.upsert({
        where: { email },
        update: {
          [preference]: value
        },
        create: {
          email,
          [preference]: value
        }
      })

    return updatedJourneysEmailPreference
  }

  @Query()
  async journeysEmailPreference(
    @Args('email') email: string
  ): Promise<JourneysEmailPreference | null> {
    return await this.prismaService.journeysEmailPreference.findUnique({
      where: { email }
    })
  }
}
