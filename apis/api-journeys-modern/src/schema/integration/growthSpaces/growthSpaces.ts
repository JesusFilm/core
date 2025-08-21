import axios, { AxiosError } from 'axios'
import { GraphQLError } from 'graphql'

import { decryptSymmetric } from '@core/nest/common/crypto'
import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { IntegrationRef } from '../integration'

import {
  IntegrationGrowthSpacesCreateInput,
  IntegrationGrowthSpacesUpdateInput
} from './inputs'
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

builder.mutationField('integrationGrowthSpacesCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: IntegrationGrowthSpacesRef,
    args: {
      input: t.arg({ type: IntegrationGrowthSpacesCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const user = context.user

      // Check if user has manage access to this team
      const userTeam = await prisma.userTeam.findFirst({
        where: {
          userId: user.id,
          teamId: input.teamId,
          role: { in: ['manager', 'member'] }
        }
      })

      if (!userTeam) {
        throw new GraphQLError('user is not allowed to create integration', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // For now, create without external API validation
      // In full implementation, this would:
      // 1. Validate credentials with GrowthSpaces API
      // 2. Encrypt the accessSecret for secure storage
      return await prisma.integration.create({
        data: {
          type: 'growthSpaces',
          teamId: input.teamId,
          accessId: input.accessId,
          accessSecretPart: input.accessSecret.slice(0, 6)
          // In full implementation:
          // accessSecretCipherText, accessSecretIv, accessSecretTag would be set
        },
        include: {
          team: true
        }
      })
    }
  })
)

builder.mutationField('integrationGrowthSpacesUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: IntegrationGrowthSpacesRef,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: IntegrationGrowthSpacesUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Check if integration exists
      const integration = await prisma.integration.findUnique({
        where: { id },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!integration) {
        throw new GraphQLError('integration not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check if user has manage access
      const userTeam = integration.team.userTeams.find(
        (ut) => ut.userId === user.id
      )
      if (!userTeam || !['manager', 'member'].includes(userTeam.role)) {
        throw new GraphQLError('user is not allowed to update integration', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // For now, update without external API validation
      // In full implementation, this would:
      // 1. Validate new credentials with GrowthSpaces API
      // 2. Re-encrypt the accessSecret for secure storage
      return await prisma.integration.update({
        where: { id },
        data: {
          accessId: input.accessId,
          accessSecretPart: input.accessSecret.slice(0, 6)
          // In full implementation:
          // accessSecretCipherText, accessSecretIv, accessSecretTag would be updated
        },
        include: {
          team: true
        }
      })
    }
  })
)
