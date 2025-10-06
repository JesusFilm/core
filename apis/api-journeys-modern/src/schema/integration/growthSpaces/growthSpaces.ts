import axios, { AxiosError } from 'axios'
import { GraphQLError } from 'graphql'

import { decryptSymmetric } from '@core/nest/common/crypto'
import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { IntegrationRef } from '../integration'

import {
  IntegrationGrowthSpacesRoute,
  IntegrationGrowthSpacesRouteRef
} from './route'

export const IntegrationGrowthSpacesRef = builder.prismaObject('Integration', {
  interfaces: [IntegrationRef],
  include: { team: true },
  variant: 'IntegrationGrowthSpaces',
  shareable: true,
  fields: (t) => ({
    accessId: t.exposeString('accessId'),
    accessSecretPart: t.exposeString('accessSecretPart'),
    team: t.relation('team'),
    routes: t.field({
      type: [IntegrationGrowthSpacesRouteRef],
      resolve: async (integration) => {
        const fullIntegration = await prisma.integration.findUnique({
          where: { id: integration.id },
          select: {
            accessId: true,
            accessSecretCipherText: true,
            accessSecretIv: true,
            accessSecretTag: true
          }
        })

        if (
          fullIntegration == null ||
          fullIntegration.accessSecretCipherText == null ||
          fullIntegration.accessSecretIv == null ||
          fullIntegration.accessSecretTag == null
        ) {
          return []
        }

        const accessSecret = await decryptSymmetric(
          fullIntegration.accessSecretCipherText,
          fullIntegration.accessSecretIv,
          fullIntegration.accessSecretTag,
          process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
        )

        try {
          const client = axios.create({
            baseURL: process.env.GROWTH_SPACES_URL,
            headers: {
              'Access-Id': fullIntegration.accessId,
              'Access-Secret': accessSecret
            }
          })
          const res = await client.get('/routes')
          return res.data as IntegrationGrowthSpacesRoute[]
        } catch (e) {
          if (e instanceof AxiosError && e.response?.status === 401) {
            throw new GraphQLError(
              'invalid credentials for Growth Spaces integration',
              { extensions: { code: 'UNAUTHORIZED' } }
            )
          }
          const message = e instanceof Error ? e.message : 'Unknown error'
          throw new GraphQLError(message, {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          })
        }
      }
    })
  })
})
