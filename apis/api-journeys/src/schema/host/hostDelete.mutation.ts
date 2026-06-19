import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { HostRef } from './host'
import { INCLUDE_HOST_ACL, hostAcl } from './host.acl'

builder.mutationField('hostDelete', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: HostRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true }),
        teamId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const host = await prisma.host.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_HOST_ACL
        })

        if (host == null)
          throw new GraphQLError('host not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!hostAcl(host, context.user))
          throw new GraphQLError('user is not allowed to delete host', {
            extensions: { code: 'FORBIDDEN' }
          })

        const journeysWithHost = await prisma.journey.findMany({
          where: { hostId: String(args.id) }
        })

        if (journeysWithHost.length > 1)
          throw new GraphQLError('This host is used in other journeys.', {
            extensions: { code: 'BAD_USER_INPUT' }
          })

        return await prisma.host.delete({
          ...query,
          where: { id: String(args.id) }
        })
      }
    })
)
