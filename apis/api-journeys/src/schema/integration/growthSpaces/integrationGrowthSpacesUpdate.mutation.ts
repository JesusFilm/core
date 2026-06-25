import axios, { AxiosError } from 'axios'
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'
import { encryptSymmetric } from '@core/yoga/crypto'

import { env } from '../../../env'
import { builder } from '../../builder'
import { INCLUDE_INTEGRATION_ACL, integrationAcl } from '../integration.acl'

import { IntegrationGrowthSpacesRef } from './growthSpaces'
import { IntegrationGrowthSpacesUpdateInput } from './inputs'

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

builder.mutationField('integrationGrowthSpacesUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: IntegrationGrowthSpacesRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true }),
        input: t.arg({
          type: IntegrationGrowthSpacesUpdateInput,
          required: true
        })
      },
      resolve: async (query, _parent, args, context) => {
        const { accessId, accessSecret } = args.input

        const integration = await prisma.integration.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_INTEGRATION_ACL
        })

        if (integration == null)
          throw new GraphQLError('integration not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!integrationAcl(integration, context.user))
          throw new GraphQLError('user is not allowed to update integration', {
            extensions: { code: 'FORBIDDEN' }
          })

        await authenticate({ accessId, accessSecret })

        const { ciphertext, iv, tag } = await encryptSymmetric(
          accessSecret,
          env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
        )

        return await prisma.integration.update({
          ...query,
          where: { id: String(args.id) },
          data: {
            accessId,
            accessSecretPart: accessSecret.slice(0, 6),
            accessSecretCipherText: ciphertext,
            accessSecretIv: iv,
            accessSecretTag: tag
          }
        })
      }
    })
)
