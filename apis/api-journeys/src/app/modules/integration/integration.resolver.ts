import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { Integration, Prisma } from '@core/prisma/journeys/client'

import { IntegrationType } from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Integration')
export class IntegrationResolver {
  constructor(private readonly prismaService: PrismaService) {}

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
  @UseGuards(AppCaslGuard)
  async integrations(
    @Args('teamId') teamId: string,
    @CaslAccessible('Integration')
    accessibleIntegrations: Prisma.IntegrationWhereInput
  ): Promise<Integration[]> {
    return await this.prismaService.integration.findMany({
      where: {
        AND: [accessibleIntegrations, { teamId }]
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async integrationDelete(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<Integration> {
    const integration = await this.prismaService.integration.findUnique({
      where: { id },
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

    return await this.prismaService.integration.delete({
      where: { id }
    })
  }
}
