import { ZodError } from 'zod'

import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Service } from '../enums/service'
import { NotFoundError, NotUniqueError } from '../error'

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
    type: 'ShortLink',
    errors: {
      types: [NotFoundError]
    },
    args: {
      pathname: t.arg.string({ required: true }),
      hostname: t.arg.string({ required: true })
    },
    nullable: false,
    resolve: async (query, _, { pathname, hostname }) => {
      try {
        return await prisma.shortLink.findFirstOrThrow({
          ...query,
          where: { pathname, domain: { hostname } }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025'
        )
          throw new NotFoundError('short link not found', [
            { path: ['pathname'], value: pathname },
            { path: ['hostname'], value: hostname }
          ])
        throw e
      }
    }
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
  shortLinkCreate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'ShortLink',
    errors: {
      types: [ZodError, NotUniqueError]
    },
    nullable: false,
    input: {
      pathname: t.input.string({ required: true }),
      to: t.input.string({
        required: true,
        validate: {
          url: true,
          refine: [
            async (to) => {
              return (
                (await prisma.shortLinkBlocklistDomain.findFirst({
                  where: { hostname: new URL(to).hostname }
                })) == null
              )
            },
            {
              message:
                'to URL appears on blocklist (https://github.com/blocklistproject/Lists)'
            }
          ]
        }
      }),
      hostname: t.input.string({ required: true }),
      service: t.input.field({ type: Service, required: true })
    },
    validate: [
      async ({ input: { hostname, service } }) => {
        return (
          (await prisma.shortLinkDomain.findFirst({
            where: {
              hostname,
              OR: [
                { services: { hasEvery: [service] } },
                { services: { isEmpty: true } }
              ]
            }
          })) != null
        )
      },
      {
        path: ['input', 'hostname'],
        message:
          'hostname not valid (short link domain may not exist or may not be setup for this service)'
      }
    ],
    resolve: async (
      query,
      _,
      { input: { pathname, to, hostname, service } },
      { user }
    ) => {
      try {
        return await prisma.shortLink.create({
          ...query,
          data: {
            pathname,
            to,
            domain: { connect: { hostname } },
            service,
            userId: user.id
          }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        )
          throw new NotUniqueError('short link already exists', [
            { path: ['input', 'hostname'], value: hostname },
            { path: ['input', 'pathname'], value: pathname }
          ])
        throw e
      }
    }
  }),
  shortLinkUpdate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'ShortLink',
    errors: {
      types: [ZodError, NotFoundError]
    },
    nullable: false,
    input: {
      id: t.input.string({ required: true }),
      to: t.input.string({
        required: true,
        validate: {
          url: true,
          refine: [
            async (to) => {
              return (
                (await prisma.shortLinkBlocklistDomain.findFirst({
                  where: { hostname: new URL(to).hostname }
                })) == null
              )
            },
            {
              message:
                'to URL appears on blocklist (https://github.com/blocklistproject/Lists)'
            }
          ]
        }
      })
    },
    resolve: async (query, _, { input: { id, to } }) => {
      try {
        return await prisma.shortLink.update({
          ...query,
          where: { id },
          data: { to }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025'
        )
          throw new NotFoundError('short link not found', [
            {
              path: ['input', 'id'],
              value: id
            }
          ])
        throw e
      }
    }
  }),
  shortLinkDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'ShortLink',
    errors: {
      types: [NotFoundError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) => {
      try {
        return await prisma.shortLink.delete({
          ...query,
          where: { id }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025'
        )
          throw new NotFoundError('short link not found', [
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
