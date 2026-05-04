import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { CustomDomainRef } from './customDomain'
import { canAccessCustomDomain } from './customDomain.acl'

builder.queryField('customDomain', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: CustomDomainRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const customDomainForAcl = await prisma.customDomain.findUnique({
        where: { id: String(args.id) },
        include: {
          team: {
            include: {
              userTeams: true,
              journeys: { include: { userJourneys: true } }
            }
          }
        }
      })

      if (customDomainForAcl == null)
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      if (!canAccessCustomDomain(Action.Read, customDomainForAcl, context.user))
        throw new GraphQLError('user is not allowed to read custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })

      return prisma.customDomain.findUniqueOrThrow({
        ...query,
        where: { id: String(args.id) }
      })
    }
  })
)
