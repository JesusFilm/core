import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import fetch from 'node-fetch'
import {
  GrowthSpaceIntegration,
  GrowthSpaceIntegrationCreateInput,
  GrowthSpaceIntegrationUpdateInput,
  GrowthSpacesRoute,
  IntegrationType
} from '../../../__generated__/graphql'

import crypto from 'crypto-js'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('GrowthSpacesIntegration')
export class GrowthSpacesIntegration {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  async growthSpacesIntegrationCreate(
    @Args('teamId') teamId: string,
    @Args('input') input: GrowthSpaceIntegrationCreateInput
  ): Promise<GrowthSpaceIntegration> {
    try {
      const res = await fetch(
        'https://api.growthspaces.org/api/v1/authentication',
        {
          headers: {
            'Access-Id': input.accessId,
            'Access-Secret': input.accessSecret
          }
        }
      )
      const data = await res.json()
      if (data === 'ok') {
        const cipherText = crypto.AES.encrypt(
          input.accessSecret,
          'secret key 123' // todo env var some key,
        ).toString()
        const growthSpaceIntegration =
          await this.prismaService.integration.create({
            data: {
              type: IntegrationType.growthSpace,
              teamId: teamId,
              accessId: input.accessId,
              accessSecret: cipherText
            }
          })
        if (
          growthSpaceIntegration.accessId != null &&
          growthSpaceIntegration.accessSecret != null
        ) {
          return {
            ...growthSpaceIntegration,
            type: IntegrationType.growthSpace,
            accessId: growthSpaceIntegration.accessId,
            accessSecretPart: `${input.accessSecret.slice(0, 6)}**********`,
            routes: await this.routes(
              growthSpaceIntegration as unknown as GrowthSpaceIntegration
            )
          }
        }
      }
      throw new GraphQLError(
        'incorrect access Id and access secret for Growth Space integration',
        {
          extensions: { code: 'BAD_USER_INPUT' }
        }
      )
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }

  @Mutation()
  async growthSpacesIntegrationUpdate(
    @Args('teamId') id: string,
    @Args('input') input: GrowthSpaceIntegrationUpdateInput
  ) {
    return await this.prismaService.integration.update({
      where: { id },
      data: { ...input }
    })
  }

  @ResolveField()
  async routes(
    @Parent() growthSpacesIntegration: GrowthSpaceIntegration
  ): Promise<GrowthSpacesRoute[]> {
    const primsaGSIntegration = await this.prismaService.integration.findUnique(
      {
        where: { id: growthSpacesIntegration.id }
      }
    )
    if (primsaGSIntegration == null) {
      throw new GraphQLError(
        'could not find Groth Spaces Integration to fetch routes',
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        }
      )
    }
    const bytes = CryptoJS.AES.decrypt(
      primsaGSIntegration?.accessSecret as string,
      'secret key 123' // todo: process env some key
    )
    const decryptedAccessSecret = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

    try {
      const res = await fetch(
        'https://api.growthspaces.org/api/v1/authentication',
        {
          headers: {
            'Access-Id': primsaGSIntegration.accessId as string,
            'Access-Secret': decryptedAccessSecret
          }
        }
      )
      const data: GrowthSpacesRoute[] = await res.json()
      return data
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }
}
