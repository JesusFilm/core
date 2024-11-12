import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Service } from '../../enums/service'

import { ShortLinkDomainCreateInput } from './input/shortLinkDomainCreate'
import { ShortLinkDomainUpdateInput } from './input/shortLinkDomainUpdate'

builder.prismaObject('ShortLinkDomain', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    hostname: t.exposeString('hostname', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'Date', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'Date', nullable: false }),
    services: t.expose('services', {
      type: [Service],
      nullable: false,
      description:
        'The services that are enabled for this domain, if empty then this domain can be used by all services'
    })
  })
})

builder.queryFields((t) => ({
  shortLinkDomains: t.prismaField({
    type: ['ShortLinkDomain'],
    nullable: false,
    args: {
      service: t.arg({
        type: Service,
        required: false,
        description:
          'Filter by service (including domains with no services set)'
      })
    },
    resolve: async (query, _, { service }) =>
      await prisma.shortLinkDomain.findMany({
        ...query,
        where:
          service != null
            ? {
                OR: [
                  { services: { hasEvery: [service] } },
                  { services: { isEmpty: true } }
                ]
              }
            : undefined,
        orderBy: {
          hostname: 'asc'
        }
      })
  }),
  shortLinkDomain: t.prismaField({
    type: 'ShortLinkDomain',
    errors: {
      types: [Prisma.PrismaClientKnownRequestError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) =>
      await prisma.shortLinkDomain.findFirstOrThrow({
        ...query,
        where: { id }
      })
  })
}))

builder.mutationFields((t) => ({
  shortLinkDomainCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'ShortLinkDomain',
    errors: {
      types: [Prisma.PrismaClientKnownRequestError]
    },
    nullable: false,
    args: {
      input: t.arg({ type: ShortLinkDomainCreateInput, required: true })
    },
    resolve: async (query, _, { input: { hostname, services } }) =>
      await prisma.shortLinkDomain.create({
        ...query,
        data: {
          hostname,
          services: services ?? []
        }
      })
  }),
  shortLinkDomainUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'ShortLinkDomain',
    errors: {
      types: [Prisma.PrismaClientKnownRequestError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: ShortLinkDomainUpdateInput, required: true })
    },
    resolve: async (query, _, { id, input: { services } }) =>
      await prisma.shortLinkDomain.update({
        ...query,
        where: { id },
        data: {
          services
        }
      })
  }),
  shortLinkDomainDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'ShortLinkDomain',
    errors: {
      types: [Prisma.PrismaClientKnownRequestError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) =>
      await prisma.shortLinkDomain.delete({
        ...query,
        where: { id }
      })
  })
}))
