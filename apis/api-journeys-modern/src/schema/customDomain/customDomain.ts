import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// CustomDomain Type using Prisma model
const CustomDomainRef = builder.prismaObject('CustomDomain', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    apexName: t.exposeString('apexName'),
    routeAllTeamJourneys: t.exposeBoolean('routeAllTeamJourneys'),
    // Relations
    team: t.relation('team'),
    journeyCollection: t.relation('journeyCollection', { nullable: true })
  })
})

// Input Types
const CustomDomainCreateInput = builder.inputType('CustomDomainCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    teamId: t.string({ required: true }),
    name: t.string({ required: true }),
    journeyCollectionId: t.id({ required: false }),
    routeAllTeamJourneys: t.boolean({ required: false })
  })
})

const CustomDomainUpdateInput = builder.inputType('CustomDomainUpdateInput', {
  fields: (t) => ({
    journeyCollectionId: t.id({ required: false }),
    routeAllTeamJourneys: t.boolean({ required: false })
  })
})

// Helper function to validate domain format
function isDomainValid(domain: string): boolean {
  return (
    domain.match(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z]$/
    ) != null
  )
}

// Simplified domain creation (without Vercel integration for now)
async function createDomain(name: string) {
  // In full implementation, this would integrate with Vercel API
  // For now, just return the apex name
  return {
    name,
    apexName: name.replace(/^www\./, '') // Remove www prefix to get apex
  }
}

// Query: customDomain
builder.queryField('customDomain', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CustomDomainRef,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      // Find custom domain with team info for authorization
      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: {
          team: {
            include: {
              userTeams: true,
              journeys: { include: { userJourneys: true } }
            }
          }
        }
      })

      if (!customDomain) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization - user must be team member or journey owner/editor
      const isTeamMember = customDomain.team.userTeams.some(
        (ut) => ut.userId === user.id
      )
      const isJourneyOwnerOrEditor = customDomain.team.journeys.some(
        (journey) =>
          journey.userJourneys.some(
            (uj) =>
              uj.userId === user.id && ['owner', 'editor'].includes(uj.role)
          )
      )

      if (!isTeamMember && !isJourneyOwnerOrEditor) {
        throw new GraphQLError('user is not allowed to read custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return customDomain
    }
  })
)

// Query: customDomains
builder.queryField('customDomains', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CustomDomainRef],
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
          'user is not allowed to access team custom domains',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.customDomain.findMany({
        where: { teamId },
        orderBy: { name: 'asc' }
      })
    }
  })
)

// Mutation: customDomainCreate
builder.mutationField('customDomainCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CustomDomainRef,
    args: {
      input: t.arg({ type: CustomDomainCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const user = context.user

      // Validate domain format
      if (!isDomainValid(input.name)) {
        throw new GraphQLError('custom domain has invalid domain name', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Check if user has manager access to this team
      const userTeam = await prisma.userTeam.findFirst({
        where: {
          userId: user.id,
          teamId: input.teamId,
          role: 'manager' // Only managers can create custom domains
        }
      })

      if (!userTeam) {
        throw new GraphQLError('user is not allowed to create custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      try {
        return await prisma.$transaction(async (tx) => {
          // Create domain (simplified without Vercel for now)
          const { apexName } = await createDomain(input.name)

          // Prepare data for creation
          const data: any = {
            ...omit(input, ['teamId', 'journeyCollectionId']),
            id: input.id ?? undefined,
            apexName,
            teamId: input.teamId,
            routeAllTeamJourneys: input.routeAllTeamJourneys ?? true
          }

          // Connect journey collection if provided
          if (input.journeyCollectionId) {
            data.journeyCollectionId = input.journeyCollectionId
          }

          const customDomain = await tx.customDomain.create({
            data
          })

          return customDomain
        })
      } catch (err: any) {
        if (err.code === 'P2002' && err.meta?.target?.includes('name')) {
          throw new GraphQLError('custom domain already exists', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }
        throw err
      }
    }
  })
)

// Mutation: customDomainUpdate
builder.mutationField('customDomainUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CustomDomainRef,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CustomDomainUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Check if custom domain exists
      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!customDomain) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check if user has manager access
      const userTeam = customDomain.team.userTeams.find(
        (ut) => ut.userId === user.id && ut.role === 'manager'
      )

      if (!userTeam) {
        throw new GraphQLError('user is not allowed to update custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.customDomain.update({
        where: { id },
        data: {
          routeAllTeamJourneys: input.routeAllTeamJourneys ?? undefined,
          journeyCollectionId: input.journeyCollectionId ?? undefined
        }
      })
    }
  })
)

// Mutation: customDomainDelete
builder.mutationField('customDomainDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CustomDomainRef,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      // Check if custom domain exists
      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!customDomain) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check if user has manager access
      const userTeam = customDomain.team.userTeams.find(
        (ut) => ut.userId === user.id && ut.role === 'manager'
      )

      if (!userTeam) {
        throw new GraphQLError('user is not allowed to delete custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // In full implementation, would also delete from Vercel
      return await prisma.customDomain.delete({
        where: { id }
      })
    }
  })
)

// Simple check result for now (without complex object types)
// customDomainCheck returns a JSON response instead of complex object
builder.mutationField('customDomainCheck', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Json',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      // Check if custom domain exists
      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!customDomain) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check if user has access to this team
      const userTeam = customDomain.team.userTeams.find(
        (ut) => ut.userId === user.id
      )

      if (!userTeam) {
        throw new GraphQLError('user is not allowed to check custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Return simplified check result
      // In full implementation, this would call Vercel API
      return {
        configured: true,
        verified: true,
        verification: [],
        verificationResponse: null
      }
    }
  })
)
