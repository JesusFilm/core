import { GraphQLError } from 'graphql'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { HostCreateInput, HostUpdateInput } from './inputs'

// Host Type
const HostRef = builder.prismaObject('Host', {
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    title: t.exposeString('title'),
    location: t.exposeString('location', { nullable: true }),
    src1: t.exposeString('src1', { nullable: true }),
    src2: t.exposeString('src2', { nullable: true }),
    // Relations
    team: t.relation('team'),
    journeys: t.relation('journeys')
  })
})

// Input types are now imported from ./inputs/

// Host Query
builder.queryField('hosts', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [HostRef],
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
        throw new GraphQLError('user is not allowed to access team hosts', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.host.findMany({
        where: { teamId },
        orderBy: { title: 'asc' }
      })
    }
  })
)

// Host Create Mutation
builder.mutationField('hostCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: HostRef,
    args: {
      teamId: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: HostCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { teamId, input } = args
      const user = context.user

      // Check if user has manage access to this team
      const userTeam = await prisma.userTeam.findFirst({
        where: {
          userId: user.id,
          teamId,
          role: { in: ['manager', 'member'] }
        }
      })

      if (!userTeam) {
        throw new GraphQLError('user is not allowed to create host', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.host.create({
        data: {
          ...input,
          teamId
        }
      })
    }
  })
)

// Host Update Mutation
builder.mutationField('hostUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: HostRef,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      teamId: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: HostUpdateInput, required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, teamId, input } = args
      const user = context.user

      // Check if host exists and belongs to the team
      const host = await prisma.host.findUnique({
        where: { id },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!host) {
        throw new GraphQLError('host not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (host.teamId !== teamId) {
        throw new GraphQLError('host does not belong to the specified team', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Check if user has manage access
      const userTeam = host.team.userTeams.find((ut) => ut.userId === user.id)
      if (!userTeam || !['manager', 'member'].includes(userTeam.role)) {
        throw new GraphQLError('user is not allowed to update host', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Validate title not being set to null (following legacy logic)
      if (input?.title === null) {
        throw new GraphQLError('host title cannot be set to null', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      return await prisma.host.update({
        where: { id },
        data: {
          ...input,
          title: input?.title ?? undefined
        }
      })
    }
  })
)

// Host Delete Mutation
builder.mutationField('hostDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: HostRef,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      teamId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, teamId } = args
      const user = context.user

      // Check if host exists and belongs to the team
      const host = await prisma.host.findUnique({
        where: { id },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!host) {
        throw new GraphQLError('host not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (host.teamId !== teamId) {
        throw new GraphQLError('host does not belong to the specified team', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Check if user has manage access
      const userTeam = host.team.userTeams.find((ut) => ut.userId === user.id)
      if (!userTeam || !['manager', 'member'].includes(userTeam.role)) {
        throw new GraphQLError('user is not allowed to delete host', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Check if host is used in other journeys (following legacy logic)
      const journeysWithHost = await prisma.journey.findMany({
        where: { hostId: id }
      })

      if (journeysWithHost.length > 1) {
        throw new GraphQLError('This host is used in other journeys.', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      return await prisma.host.delete({
        where: { id }
      })
    }
  })
)
