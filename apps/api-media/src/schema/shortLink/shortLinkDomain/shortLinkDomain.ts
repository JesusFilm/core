import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Service } from '../../enums/service'
import { NotFoundError, NotUniqueError } from '../../error'

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
      types: [NotFoundError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) => {
      try {
        return await prisma.shortLinkDomain.findFirstOrThrow({
          ...query,
          where: { id }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025'
        )
          throw new NotFoundError('short link domain not found', [
            {
              path: ['id'],
              value: id
            }
          ])
        throw e
      }
    }
  })
}))

builder.mutationFields((t) => ({
  shortLinkDomainCreate: t
    .withAuth({ isPublisher: true })
    .prismaFieldWithInput({
      type: 'ShortLinkDomain',
      errors: {
        types: [NotUniqueError]
      },
      nullable: false,
      input: {
        hostname: t.input.string({ required: true }),
        services: t.input.field({ type: [Service], required: false })
      },
      resolve: async (query, _, { input: { hostname, services } }) => {
        try {
          return await prisma.shortLinkDomain.create({
            ...query,
            data: {
              hostname,
              services: services ?? []
            }
          })
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2002'
          )
            throw new NotUniqueError('short link domain already exists', [
              { path: ['input', 'hostname'], value: hostname }
            ])
          throw e
        }
      }
    }),
  shortLinkDomainUpdate: t
    .withAuth({ isPublisher: true })
    .prismaFieldWithInput({
      type: 'ShortLinkDomain',
      errors: {
        types: [NotFoundError]
      },
      nullable: false,
      input: {
        id: t.input.string({ required: true }),
        services: t.input.field({ type: [Service], required: true })
      },
      resolve: async (query, _, { input: { id, services } }) => {
        try {
          return await prisma.shortLinkDomain.update({
            ...query,
            where: { id },
            data: {
              services
            }
          })
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2025'
          )
            throw new NotFoundError('short link domain not found', [
              {
                path: ['input', 'id'],
                value: id
              }
            ])
          throw e
        }
      }
    }),
  shortLinkDomainDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'ShortLinkDomain',
    errors: {
      types: [NotFoundError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) => {
      try {
        return await prisma.shortLinkDomain.delete({
          ...query,
          where: { id }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025'
        )
          throw new NotFoundError('short link domain not found', [
            {
              path: ['id'],
              value: id
            }
          ])
        throw e
      }
    }
  })
}))
