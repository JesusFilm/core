import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { CustomDomainRef } from './customDomain'
import { canAccessCustomDomain } from './customDomain.acl'
import {
  deleteVercelDomain,
  updateTeamShortLinks
} from './customDomain.service'

builder.mutationField('customDomainDelete', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: CustomDomainRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })

      if (customDomain == null) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessCustomDomain(Action.Delete, customDomain, context.user)) {
        throw new GraphQLError('user is not allowed to delete custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      await prisma.$transaction(async (tx) => {
        await updateTeamShortLinks(customDomain.teamId, customDomain.name)
        await tx.customDomain.delete({ where: { id } })
        await deleteVercelDomain(customDomain)
      })

      return customDomain
    }
  })
)
