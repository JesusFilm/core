import { GraphQLError } from 'graphql'

import { IntegrationType } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// Integration Type Enum
export const IntegrationTypeEnum = builder.enumType('IntegrationType', {
  values: ['growthSpaces'] as const
})

// Integration Type using Prisma model - single definition
const IntegrationRef = builder.prismaObject('Integration', {
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: IntegrationTypeEnum }),
    accessId: t.exposeString('accessId', { nullable: true }),
    accessSecretPart: t.exposeString('accessSecretPart', { nullable: true }),
    // Relations
    team: t.relation('team')
  })
})

// Input Types
const IntegrationGrowthSpacesCreateInput = builder.inputType(
  'IntegrationGrowthSpacesCreateInput',
  {
    fields: (t) => ({
      accessId: t.string({ required: true }),
      accessSecret: t.string({ required: true }),
      teamId: t.string({ required: true })
    })
  }
)

const IntegrationGrowthSpacesUpdateInput = builder.inputType(
  'IntegrationGrowthSpacesUpdateInput',
  {
    fields: (t) => ({
      accessId: t.string({ required: true }),
      accessSecret: t.string({ required: true })
    })
  }
)

// Query: integrations
builder.queryField('integrations', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [IntegrationRef],
    args: {
      teamId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { teamId } = args
      const user = context.user

      // Check if user has access to this team
      const userTeam = await prisma.userTeam.findFirst({
        where: {
          userId: user.id,
          teamId
        }
      })

      if (!userTeam) {
        throw new GraphQLError(
          'user is not allowed to access team integrations',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.integration.findMany({
        where: { teamId },
        orderBy: { type: 'asc' }
      })
    }
  })
)

// Mutation: integrationGrowthSpacesCreate
builder.mutationField('integrationGrowthSpacesCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: IntegrationRef,
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
        }
      })
    }
  })
)

// Mutation: integrationGrowthSpacesUpdate
builder.mutationField('integrationGrowthSpacesUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: IntegrationRef,
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
        }
      })
    }
  })
)

// Mutation: integrationDelete
builder.mutationField('integrationDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: IntegrationRef,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
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
        throw new GraphQLError('user is not allowed to delete integration', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.integration.delete({
        where: { id }
      })
    }
  })
)
