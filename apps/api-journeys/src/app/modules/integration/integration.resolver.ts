import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { IntegrationInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { Integration } from '.prisma/api-journeys-client'

@Resolver('Integration')
export class IntegrationResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async integrations(@Args('teamId') teamId: string): Promise<Integration[]> {
    return this.prismaService.integration.findMany({
      where: { teamId }
    })
  }

  @Mutation()
  async integrationDelete(
    @Args('input') input: IntegrationInput
  ): Promise<Integration> {
    return this.prismaService.integration.delete({
      where: { id: input.id }
    })
  }
}
