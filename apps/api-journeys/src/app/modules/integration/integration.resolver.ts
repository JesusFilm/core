import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { IntegrationInput, IntegrationType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { subject } from '@casl/ability'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { IntegrationService } from './integration.service'
import { Integration } from '.prisma/api-journeys-client'

@Resolver('Integration')
export class IntegrationResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly integrationService: IntegrationService
  ) {}

  @ResolveField()
  __resolveType(obj: { type: IntegrationType }): string {
    switch (obj.type) {
      case 'growthSpaces':
        return 'IntegrationGrowthSpaces'
      default:
        return 'Integration'
    }
  }

  @Query()
  async integrations(@Args('teamId') teamId: string): Promise<Integration[]> {
    return this.prismaService.integration.findMany({
      where: { teamId }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async integrationDelete(
    @Args('input') input: IntegrationInput,
    @CaslAbility() ability: AppAbility
  ): Promise<Integration> {
    const integration = await this.prismaService.integration.findUnique({
      where: { id: input.id },
      include: { team: { include: { userTeams: true } } }
    })
    if (integration == null)
      throw new GraphQLError('integration not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    if (!ability.can(Action.Manage, subject('Integration', integration)))
      throw new GraphQLError('user is not allowed to delete integration', {
        extensions: { code: 'FORBIDDEN' }
      })

    return await this.integrationService.delete(input)
  }
}
