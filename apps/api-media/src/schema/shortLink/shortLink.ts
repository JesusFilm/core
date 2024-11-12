import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Service } from '../enums/service'

import { ShortLinkCreateInput } from './input/shortLinkCreate'
import { ShortLinkUpdateInput } from './input/shortLinkUpdate'

const ShortLink = builder.prismaObject('ShortLink', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    pathname: t.exposeString('pathname', { nullable: false }),
    to: t.exposeString('to', { nullable: false }),
    domain: t.relation('domain', { nullable: false }),
    service: t.expose('service', { type: Service, nullable: false })
  })
})

builder.asEntity(ShortLink, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.shortLink.findUniqueOrThrow({ where: { id } })
})

builder.queryFields((t) => ({
  shortLink: t.prismaField({
    errors: {
      types: [Prisma.PrismaClientKnownRequestError]
    },
    type: 'ShortLink',
    args: {
      pathname: t.arg.string({ required: true }),
      hostname: t.arg.string({ required: true })
    },
    nullable: false,
    resolve: async (query, _, { pathname, hostname }) =>
      await prisma.shortLink.findFirstOrThrow({
        ...query,
        where: { pathname, domain: { hostname } }
      })
  }),
  shortLinks: t.withAuth({ isPublisher: true }).prismaField({
    type: ['ShortLink'],
    nullable: false,
    args: {
      hostname: t.arg.string()
    },
    resolve: async (query, _, { hostname }) =>
      await prisma.shortLink.findMany({
        ...query,
        where: hostname != null ? { domain: { hostname } } : undefined,
        orderBy: {
          domain: { hostname: 'asc' },
          pathname: 'asc'
        }
      })
  })
}))

builder.mutationFields((t) => ({
  shortLinkCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'ShortLink',
    errors: {
      types: [Prisma.PrismaClientKnownRequestError]
    },
    nullable: false,
    args: {
      input: t.arg({ type: ShortLinkCreateInput, required: true })
    },
    resolve: async (
      query,
      _,
      { input: { pathname, to, hostname, service } },
      { user }
    ) => {
      const domain = await prisma.shortLinkDomain.findFirstOrThrow({
        where: {
          hostname,
          OR: [
            { services: { hasEvery: [service] } },
            { services: { isEmpty: true } }
          ]
        }
      })
      return await prisma.shortLink.create({
        ...query,
        data: {
          pathname,
          to,
          domainId: domain.id,
          service,
          userId: user.id
        }
      })
    }
  }),
  shortLinkUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'ShortLink',
    errors: {
      types: [Prisma.PrismaClientKnownRequestError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: ShortLinkUpdateInput, required: true })
    },
    resolve: async (query, _, { id, input: { to } }) =>
      await prisma.shortLink.update({
        ...query,
        where: { id },
        data: { to }
      })
  }),
  shortLinkDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'ShortLink',
    errors: {
      types: [Prisma.PrismaClientKnownRequestError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) =>
      await prisma.shortLink.delete({
        ...query,
        where: { id }
      })
  })
}))
