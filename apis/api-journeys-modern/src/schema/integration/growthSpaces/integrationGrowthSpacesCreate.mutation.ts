import axios, { AxiosError } from 'axios'
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'
import { encryptSymmetric } from '@core/yoga/crypto'

import { env } from '../../../env'
import { builder } from '../../builder'
import { INCLUDE_INTEGRATION_ACL, integrationAcl } from '../integration.acl'

import { IntegrationGrowthSpacesRef } from './growthSpaces'
import { IntegrationGrowthSpacesCreateInput } from './inputs'

async function authenticate(input: {
  accessId: string
  accessSecret: string
}): Promise<void> {
  const client = axios.create({
    baseURL: env.GROWTH_SPACES_URL,
    headers: {
      'Access-Id': input.accessId,
      'Access-Secret': input.accessSecret
    }
  })
  try {
    await client.get('/authentication')
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401)
      throw new GraphQLError(
        'invalid credentials for Growth Spaces integration',
        { extensions: { code: 'UNAUTHORIZED' } }
      )
    const message = e instanceof Error ? e.message : 'Unknown error'
    throw new GraphQLError(message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }
}

builder.mutationField('integrationGrowthSpacesCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: IntegrationGrowthSpacesRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        input: t.arg({
          type: IntegrationGrowthSpacesCreateInput,
          required: true
        })
      },
      resolve: async (query, _parent, args, context) => {
        const { accessId, accessSecret, teamId } = args.input

        await authenticate({ accessId, accessSecret })

        const { ciphertext, iv, tag } = await encryptSymmetric(
          accessSecret,
          env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
        )

        return await prisma.$transaction(async (tx) => {
          const integration = await tx.integration.create({
            data: {
              type: 'growthSpaces',
              teamId,
              accessId,
              accessSecretPart: accessSecret.slice(0, 6),
              accessSecretCipherText: ciphertext,
              accessSecretIv: iv,
              accessSecretTag: tag
            },
            include: INCLUDE_INTEGRATION_ACL
          })

          if (!integrationAcl(integration, context.user))
            throw new GraphQLError(
              'user is not allowed to create integration',
              { extensions: { code: 'FORBIDDEN' } }
            )

          return tx.integration.findUniqueOrThrow({
            ...query,
            where: { id: integration.id }
          })
        })
      }
    })
)
