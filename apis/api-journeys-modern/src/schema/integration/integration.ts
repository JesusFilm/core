import axios from 'axios'
import { GraphQLError } from 'graphql'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { IntegrationType as IntegrationTypeEnum } from './enums'

const IntegrationRef = builder.prismaInterface('Integration', {
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: IntegrationTypeEnum }),
    team: t.relation('team')
  })
})
// Define interfaces for route type
interface IntegrationGrowthSpacesRoute {
  id: string
  name: string
}

// Define the route object type using objectRef
const IntegrationGrowthSpacesRoute =
  builder.objectRef<IntegrationGrowthSpacesRoute>(
    'IntegrationGrowthSpacesRoute'
  )

IntegrationGrowthSpacesRoute.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    name: t.exposeString('name')
  })
})

// IntegrationGrowthSpaces implementation using Prisma object
const IntegrationGrowthSpacesRef = builder.prismaObject('Integration', {
  interfaces: [IntegrationRef],
  include: { team: true },
  variant: 'IntegrationGrowthSpaces',
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: IntegrationTypeEnum }),
    accessId: t.exposeString('accessId'),
    accessSecretPart: t.exposeString('accessSecretPart'),
    team: t.relation('team'),
    routes: t.field({
      type: [IntegrationGrowthSpacesRoute],
      resolve: async (integration) => {
        // Mock implementation - in real scenario this would call GrowthSpaces API
        try {
          // Simulate API call to get routes
          return [
            { id: 'route1', name: 'Default Route' },
            { id: 'route2', name: 'Welcome Route' }
          ]
        } catch (error) {
          console.error('Failed to fetch GrowthSpaces routes:', error)
          return []
        }
      }
    })
  })
})

// Export the integration types for use in other files
export { IntegrationRef, IntegrationGrowthSpacesRef }

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

// Mutation: integrationGrowthSpacesUpdate
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
