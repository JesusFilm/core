import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  IntegrationInput,
  IntegrationsFilter
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Integration')
export class IntegrationResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async integrations(@Args('input') input: IntegrationsFilter) {}

  @Mutation()
  async integrationDelete(@Args('input') input: IntegrationInput) {}
}
