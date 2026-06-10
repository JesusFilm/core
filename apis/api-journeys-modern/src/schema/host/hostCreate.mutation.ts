import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { HostRef } from './host'
import { INCLUDE_HOST_ACL, hostAcl } from './host.acl'
import { HostCreateInput } from './inputs'

builder.mutationField('hostCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: HostRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        teamId: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: HostCreateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        return await prisma.$transaction(async (tx) => {
          const createdHost = await tx.host.create({
            data: {
              ...args.input,
              team: { connect: { id: String(args.teamId) } }
            }
          })

          const host = await tx.host.findUnique({
            where: { id: createdHost.id },
            include: INCLUDE_HOST_ACL
          })

          if (host == null)
            throw new GraphQLError('host not found', {
              extensions: { code: 'NOT_FOUND' }
            })

          if (!hostAcl(host, context.user))
            throw new GraphQLError('user is not allowed to create host', {
              extensions: { code: 'FORBIDDEN' }
            })

          return tx.host.findUniqueOrThrow({
            ...query,
            where: { id: createdHost.id }
          })
        })
      }
    })
)
