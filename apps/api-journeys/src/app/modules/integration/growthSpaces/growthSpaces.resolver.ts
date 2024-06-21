import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import fetch from 'node-fetch'
import {
  GrowthSpacesRoute,
  IntegrationGrowthSpaceCreateInput,
  IntegrationGrowthSpaceUpdateInput,
  IntegrationType
} from '../../../__generated__/graphql'

import { PrismaService } from '../../../lib/prisma.service'

import { IntegrationService } from '../integration.service'
import { GrowthSpacesIntegrationService } from './growthSpaces.service'
import { Integration } from '.prisma/api-journeys-client'

@Resolver('GrowthSpacesIntegration')
export class GrowthSpacesIntegrationResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly integrationService: IntegrationService,
    private readonly growthSpacesIntegrationService: GrowthSpacesIntegrationService
  ) {}

  @Mutation()
  async integrationGrowthSpacesCreate(
    @Args('teamId') teamId: string,
    @Args('input') input: IntegrationGrowthSpaceCreateInput
  ): Promise<Integration> {
    await this.growthSpacesIntegrationService.authenticate(
      input.accessId,
      input.accessSecret
    )
    const { ciphertext, iv, tag } =
      await this.integrationService.encryptSymmetric(
        'some-key',
        input.accessSecret
      )
    return await this.prismaService.integration.create({
      data: {
        type: IntegrationType.growthSpaces,
        teamId: teamId,
        accessId: input.accessId,
        accessSecretCipherText: ciphertext,
        accessSecretIv: iv,
        accessSecretTag: tag
      }
    })
  }

  @Mutation()
  async integrationGrowthSpacesUpdate(
    @Args('teamId') id: string,
    @Args('input') input: IntegrationGrowthSpaceUpdateInput
  ): Promise<Integration> {
    await this.growthSpacesIntegrationService.authenticate(
      input.accessId,
      input.accessSecret
    )
    const { ciphertext, iv, tag } =
      await this.integrationService.encryptSymmetric(
        'some-key',
        input.accessSecret
      )
    return await this.prismaService.integration.update({
      where: { id },
      data: {
        accessSecretCipherText: ciphertext,
        accessSecretIv: iv,
        accessSecretTag: tag,
        ...input
      }
    })
  }

  @ResolveField()
  async routes(
    @Parent() integration: Integration
  ): Promise<GrowthSpacesRoute[]> {
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
        'some-key',
        accessSecretCipherText,
        accessSecretIv,
        accessSecretTag
      )

    try {
      const res = await fetch('https://api.growthspaces.org/api/v1/routes', {
        headers: {
          'Access-Id': integration.accessId as string,
          'Access-Secret': decryptedAccessSecret
        }
      })
      const data: GrowthSpacesRoute[] = await res.json()
      return data
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }
}
