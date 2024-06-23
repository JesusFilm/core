import { ApolloClient, InMemoryCache } from '@apollo/client'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

import { Inject, Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql/error'
import { PrismaService } from '../../../lib/prisma.service'
import { IntegrationService } from '../integration.service'
import { Block } from '.prisma/api-journeys-client'

@Injectable()
export class GrowthSpacesIntegrationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly integrationService: IntegrationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async authenticate(accessId: string, accessSecret: string): Promise<void> {
    try {
      await fetch('https://api.growthspaces.org/api/v1/authentication', {
        headers: {
          'Access-Id': accessId,
          'Access-Secret': accessSecret
        }
      })
    } catch (e) {
      throw new GraphQLError(
        'incorrect access Id and access secret for Growth Space integration',
        {
          extensions: { code: 'UNAUTHORIZED' }
        }
      )
    }
  }

  async addSubscriber(
    journeyId: string,
    block: Block,
    email: string
  ): Promise<void> {
    if (block.integrationId == null || block.routeId == null)
      throw new GraphQLError(
        'trying to add subscriber but the integration or route id is not set',
        {
          extensions: { code: 'BAD_USER_INPUT' }
        }
      )

    const apollo = new ApolloClient({
      uri: process.env.GATEWAY_URL,
      cache: new InMemoryCache()
    })

    const integration = await this.prismaService.integration.findUnique({
      where: { id: block.integrationId }
    })

    const journey = await this.prismaService.journey.findUnique({
      where: { id: journeyId }
    })

    if (
      integration?.accessId == null ||
      integration?.accessSecretCipherText == null ||
      integration?.accessSecretIv == null ||
      integration?.accessSecretTag == null
    )
      throw new GraphQLError(
        'incorrect access Id and access secret for Growth Space integration',
        {
          extensions: { code: 'UNAUTHORIZED' }
        }
      )

    const decryptedAccessSecret =
      await this.integrationService.decryptSymmetric(
        integration.accessSecretCipherText,
        integration.accessSecretIv,
        integration.accessSecretTag,
        process.env.INTEGRATION_CRYPTO_KEY
      )

    const body = JSON.stringify({
      subscriber: {
        route_id: block.routeId,
        language_code: 'EN',
        email
      }
    })

    try {
      await fetch('https://api.growthspaces.org/api/v1/subscribers', {
        method: 'POST',
        headers: {
          'Access-Id': integration.accessId,
          'Access-Secret': decryptedAccessSecret,
          'Content-Type': 'application/json'
        },
        body
      })
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL SERVER ERROR' }
      })
    }
  }
}
