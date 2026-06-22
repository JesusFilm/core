import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { HostRef } from './host'
import { INCLUDE_HOST_ACL, hostAcl } from './host.acl'
import { HostUpdateInput } from './inputs'

builder.mutationField('hostUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: HostRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true }),
        teamId: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: HostUpdateInput, required: false })
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
          throw new GraphQLError('user is not allowed to update host', {
            extensions: { code: 'FORBIDDEN' }
          })

        if (args.input?.title === null)
          throw new GraphQLError('host title cannot be set to null', {
            extensions: { code: 'BAD_USER_INPUT' }
          })

        return await prisma.host.update({
          ...query,
          where: { id: String(args.id) },
          data: {
            ...args.input,
            title: args.input?.title ?? undefined
          }
        })
      }
    })
)
