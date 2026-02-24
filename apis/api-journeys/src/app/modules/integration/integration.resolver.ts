import { UseGuards } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { Integration, Prisma, Team } from '@core/prisma/journeys/client'

import { IntegrationType } from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { CaslAccessible } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Integration')
export class IntegrationResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField()
  __resolveType(obj: { type: IntegrationType }): string {
    switch (obj.type) {
      case 'google':
        return 'IntegrationGoogle'
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
      },
      include: { team: true }
    })
  }

  @ResolveField()
  async team(@Parent() integration: Integration): Promise<Team> {
    const result = await this.prismaService.team.findUnique({
      where: { id: integration.teamId }
    })
    // team is required by schema and foreign key constraint ensures presence
    return result!
  }
}
