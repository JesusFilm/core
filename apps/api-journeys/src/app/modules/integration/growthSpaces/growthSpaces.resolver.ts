import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import fetch from 'node-fetch'
import {
  GrowthSpacesRoute,
  IntegrationGrowthSpacesCreateInput,
  IntegrationGrowthSpacesUpdateInput,
  IntegrationType
} from '../../../__generated__/graphql'

import { PrismaService } from '../../../lib/prisma.service'

import { IntegrationService } from '../integration.service'
import { IntegrationGrothSpacesService } from './growthSpaces.service'
import { Integration } from '.prisma/api-journeys-client'

@Resolver('IntegrationGrowthSpaces')
export class IntegrationGrowthSpacesResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly integrationService: IntegrationService,
    private readonly integrationGrowthSpacesService: IntegrationGrothSpacesService
  ) {}

  @Mutation()
  async integrationGrowthSpacesCreate(
    @Args('teamId') teamId: string,
    @Args('input') input: IntegrationGrowthSpacesCreateInput
  ): Promise<Integration> {
    await this.integrationGrowthSpacesService.authenticate(
      input.accessId,
      input.accessSecret
    )

    const { ciphertext, iv, tag } =
      await this.integrationService.encryptSymmetric(
        input.accessSecret,
        process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
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
    @Args('id') id: string,
    @Args('input') input: IntegrationGrowthSpacesUpdateInput
  ): Promise<Integration> {
    await this.integrationGrowthSpacesService.authenticate(
      input.accessId,
      input.accessSecret
    )
    const { ciphertext, iv, tag } =
      await this.integrationService.encryptSymmetric(
        input.accessSecret,
        process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
      )
    return await this.prismaService.integration.update({
      where: { id },
      data: {
        accessId: input.accessId,
        accessSecretCipherText: ciphertext,
        accessSecretIv: iv,
        accessSecretTag: tag
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
      const data: GrowthSpacesRoute[] = await res.json()
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
