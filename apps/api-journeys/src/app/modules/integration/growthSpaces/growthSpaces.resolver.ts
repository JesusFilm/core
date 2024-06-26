import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import fetch from 'node-fetch'
import {
  IntegrationGrowthSpacesCreateInput,
  IntegrationGrowthSpacesRoute,
  IntegrationGrowthSpacesUpdateInput
} from '../../../__generated__/graphql'

import { PrismaService } from '../../../lib/prisma.service'

import { subject } from '@casl/ability'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { UseGuards } from '@nestjs/common'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { IntegrationService } from '../integration.service'
import { IntegrationGrowthSpacesService } from './growthSpaces.service'
import { Integration } from '.prisma/api-journeys-client'

@Resolver('IntegrationGrowthSpaces')
export class IntegrationGrowthSpacesResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly integrationService: IntegrationService,
    private readonly integrationGrowthSpacesService: IntegrationGrowthSpacesService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async integrationGrowthSpacesCreate(
    @Args('input') input: IntegrationGrowthSpacesCreateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<Integration> {
    const team = await this.prismaService.team.findUnique({
      where: { id: input.teamId },
      include: { userTeams: true }
    })

    if (team == null) {
      throw new GraphQLError('team not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    if (!ability.can(Action.Read, subject('Team', team))) {
      throw new GraphQLError('user is not allowed to create integration', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    return await this.integrationGrowthSpacesService.create(input)
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
    const {
      accessId,
      accessSecretCipherText,
      accessSecretIv,
      accessSecretTag
    } = integration

    if (
      accessId == null ||
      accessSecretCipherText == null ||
      accessSecretIv == null ||
      accessSecretTag == null
    )
      throw new GraphQLError(
        'incorrect access Id and access secret for Growth Space integration',
        {
          extensions: { code: 'UNAUTHORIZED' }
        }
      )

    const decryptedAccessSecret =
      await this.integrationService.decryptSymmetric(
        accessSecretCipherText,
        accessSecretIv,
        accessSecretTag,
        process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
      )

    try {
      const res = await fetch('https://api.growthspaces.org/api/v1/routes', {
        headers: {
          'Access-Id': integration.accessId as string,
          'Access-Secret': decryptedAccessSecret
        }
      })
      if (!res.ok) {
        throw new GraphQLError(
          'incorrect access Id and access secret for Growth Space integration',
          {
            extensions: { code: 'UNAUTHORIZED' }
          }
        )
      }
      const data: IntegrationGrowthSpacesRoute[] = await res.json()
      return data
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }

  @ResolveField('accessSecretPart')
  async accessSecretPart(@Parent() integration: Integration): Promise<string> {
    const {
      accessId,
      accessSecretCipherText,
      accessSecretIv,
      accessSecretTag
    } = integration
    if (
      accessId == null ||
      accessSecretCipherText == null ||
      accessSecretIv == null ||
      accessSecretTag == null
    ) {
      throw new GraphQLError(
        'incorrect access Id and access secret for Growth Space integration',
        {
          extensions: { code: 'UNAUTHORIZED' }
        }
      )
    }
    const decryptedAccessSecret =
      await this.integrationService.decryptSymmetric(
        accessSecretCipherText,
        accessSecretIv,
        accessSecretTag,
        process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
      )
    return decryptedAccessSecret.slice(0, 6)
  }
}
