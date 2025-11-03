import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Integration, Team } from '@core/prisma/journeys/client'

import {
  IntegrationGrowthSpacesCreateInput,
  IntegrationGrowthSpacesRoute,
  IntegrationGrowthSpacesUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'

import { IntegrationGrowthSpacesService } from './growthSpaces.service'

@Resolver('IntegrationGrowthSpaces')
export class IntegrationGrowthSpacesResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly integrationGrowthSpacesService: IntegrationGrowthSpacesService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async integrationGrowthSpacesCreate(
    @Args('input') input: IntegrationGrowthSpacesCreateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<Integration> {
    return await this.prismaService.$transaction(async (tx) => {
      const integration = await this.integrationGrowthSpacesService.create(
        input,
        tx
      )

      if (!ability.can(Action.Read, subject('Integration', integration))) {
        throw new GraphQLError('user is not allowed to create integration', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return integration
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async integrationGrowthSpacesUpdate(
    @Args('id') id: string,
    @Args('input') input: IntegrationGrowthSpacesUpdateInput,
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

    if (!ability.can(Action.Manage, subject('Integration', integration))) {
      throw new GraphQLError('user is not allowed to update integration', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    return await this.integrationGrowthSpacesService.update(id, input)
  }

  @ResolveField()
  async routes(
    @Parent() integration: Integration
  ): Promise<IntegrationGrowthSpacesRoute[]> {
    return await this.integrationGrowthSpacesService.routes(integration)
  }

  @ResolveField()
  async team(@Parent() integration: Integration): Promise<Team> {
    const res = await this.prismaService.integration
      .findUnique({ where: { id: integration.id } })
      .team()
    return res as Team
  }
}
