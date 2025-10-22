import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CustomDomainCreateInput, CustomDomainUpdateInput } from './inputs'

// CustomDomainCheck and related types (shareable to match federated schema)
interface CustomDomainVerificationType {
  type: string
  domain: string
  value: string
  reason: string
}

interface CustomDomainVerificationResponseType {
  code: string
  message: string
}

interface CustomDomainCheckType {
  configured: boolean
  verified: boolean
  verification?: CustomDomainVerificationType[] | null
  verificationResponse?: CustomDomainVerificationResponseType | null
}

const CustomDomainVerificationRef =
  builder.objectRef<CustomDomainVerificationType>('CustomDomainVerification')

builder.objectType(CustomDomainVerificationRef, {
  shareable: true,
  fields: (t) => ({
    type: t.string({
      nullable: false,
      resolve: (obj) => obj.type
    }),
    domain: t.string({
      nullable: false,
      resolve: (obj) => obj.domain
    }),
    value: t.string({
      nullable: false,
      resolve: (obj) => obj.value
    }),
    reason: t.string({
      nullable: false,
      resolve: (obj) => obj.reason
    })
  })
})

const CustomDomainVerificationResponseRef =
  builder.objectRef<CustomDomainVerificationResponseType>(
    'CustomDomainVerificationResponse'
  )

builder.objectType(CustomDomainVerificationResponseRef, {
  shareable: true,
  fields: (t) => ({
    code: t.string({
      nullable: false,
      resolve: (obj) => obj.code
    }),
    message: t.string({
      nullable: false,
      resolve: (obj) => obj.message
    })
  })
})

const CustomDomainCheckRef =
  builder.objectRef<CustomDomainCheckType>('CustomDomainCheck')

builder.objectType(CustomDomainCheckRef, {
  shareable: true,
  fields: (t) => ({
    configured: t.boolean({
      nullable: false,
      resolve: (obj) => obj.configured
    }),
    verified: t.boolean({
      nullable: false,
      resolve: (obj) => obj.verified
    }),
    verification: t.field({
      // In SDL: [CustomDomainVerification!] (nullable list, non-null elements)
      type: [CustomDomainVerificationRef],
      nullable: true,
      resolve: (obj) => obj.verification ?? null
    }),
    verificationResponse: t.field({
      type: CustomDomainVerificationResponseRef,
      nullable: true,
      resolve: (obj) => obj.verificationResponse ?? null
    })
  })
})

export const CustomDomainRef = builder.prismaObject('CustomDomain', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    apexName: t.exposeString('apexName', { nullable: false }),
    routeAllTeamJourneys: t.exposeBoolean('routeAllTeamJourneys', {
      nullable: false
    }),
    team: t.relation('team', { nullable: false }),
    journeyCollection: t.relation('journeyCollection', { nullable: true })
  })
})

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
    override: {
      from: 'api-journeys'
    },
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
    override: {
      from: 'api-journeys'
    },
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
    override: {
      from: 'api-journeys'
    },
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
    override: {
      from: 'api-journeys'
    },
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
    override: {
      from: 'api-journeys'
    },
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
    override: {
      from: 'api-journeys'
    },
    type: CustomDomainCheckRef,
    nullable: false,
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

      // Return simplified check result (placeholder for Vercel integration)
      const result: CustomDomainCheckType = {
        configured: true,
        verified: true,
        verification: [],
        verificationResponse: null
      }

      return result
    }
  })
)
