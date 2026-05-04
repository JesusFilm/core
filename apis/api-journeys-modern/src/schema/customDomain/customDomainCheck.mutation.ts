import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { canAccessCustomDomain } from './customDomain.acl'
import { CustomDomainCheck } from './customDomainCheck'
import { checkVercelDomain } from './service'

builder.mutationField('customDomainCheck', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: CustomDomainCheck,
    nullable: false,
    override: { from: 'api-journeys' },
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

      if (!canAccessCustomDomain(Action.Manage, customDomain, context.user)) {
        throw new GraphQLError('user is not allowed to check custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await checkVercelDomain(customDomain.name)
    }
  })
)
