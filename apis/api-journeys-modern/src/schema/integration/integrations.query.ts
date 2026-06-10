import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { IntegrationRef } from './integration'
import { INCLUDE_INTEGRATION_ACL, integrationAcl } from './integration.acl'

builder.queryField('integrations', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [IntegrationRef],
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        teamId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const integrations = await prisma.integration.findMany({
          ...query,
          where: { teamId: String(args.teamId) },
          include: { ...query.include, ...INCLUDE_INTEGRATION_ACL }
        })

        return integrations.filter((integration) =>
          integrationAcl(integration, context.user)
        )
      }
    })
)
