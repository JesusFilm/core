import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { HostRef } from './host'
import { INCLUDE_HOST_ACL, hostAcl } from './host.acl'

builder.queryField('hosts', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [HostRef],
      nullable: false,
      args: {
        teamId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const hosts = await prisma.host.findMany({
          ...query,
          where: { teamId: String(args.teamId) },
          include: { ...query.include, ...INCLUDE_HOST_ACL }
        })

        return hosts.filter((host) => hostAcl(host, context.user))
      }
    })
)
