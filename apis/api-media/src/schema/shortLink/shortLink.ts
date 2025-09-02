import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid'
import { ZodError } from 'zod'

import { Prisma, prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { Service } from '../enums/service'
import { NotFoundError, NotUniqueError } from '../error'

import { RedirectType } from './enums/redirectType'

const ShortLink = builder.prismaObject('ShortLink', {
  description: 'A short link that redirects to a full URL',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    pathname: t.exposeString('pathname', {
      nullable: false,
      description: 'short link path not including the leading slash'
    }),
    to: t.exposeString('to', {
      nullable: false,
      description:
        'the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to'
    }),
    domain: t.relation('domain', { nullable: false }),
    service: t.expose('service', {
      type: Service,
      nullable: false,
      description: 'the service that created this short link'
    }),
    brightcoveId: t.exposeString('brightcoveId', {
      nullable: true,
      description: 'brightcove video ID for video redirects'
    }),
    redirectType: t.expose('redirectType', {
      type: RedirectType,
      nullable: true,
      description: 'type of video redirect (hls, dl, dh, s)'
    }),
    bitrate: t.exposeInt('bitrate', {
      nullable: true,
      description: 'bitrate of the video variant download'
    })
  })
})

builder.asEntity(ShortLink, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.shortLink.findUniqueOrThrow({ where: { id } })
})

builder.queryFields((t) => ({
  shortLinkByPath: t.prismaField({
    type: 'ShortLink',
    description: 'find a short link by path and hostname',
    errors: {
      types: [NotFoundError]
    },
    args: {
      pathname: t.arg.string({
        required: true,
        description: 'short link path not including the leading slash'
      }),
      hostname: t.arg.string({
        required: true,
        description:
          'the hostname including subdomain, domain, and TLD, but excluding port'
      })
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
  shortLink: t
    .withAuth({ isPublisher: true, isValidInterop: true })
    .prismaField({
      type: 'ShortLink',
      description: 'find a short link by id',
      errors: {
        types: [NotFoundError]
      },
      args: {
        id: t.arg.string({ required: true })
      },
      nullable: false,
      resolve: async (query, _, { id }) => {
        try {
          return await prisma.shortLink.findFirstOrThrow({
            ...query,
            where: { id }
          })
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2025'
          )
            throw new NotFoundError('short link not found', [
              { path: ['id'], value: id }
            ])
          throw e
        }
      }
    }),
  shortLinks: t
    .withAuth({ isPublisher: true, isValidInterop: true })
    .prismaConnection({
      cursor: 'id',
      type: 'ShortLink',
      description: 'find all short links with optional hostname filter',
      nullable: false,
      args: {
        hostname: t.arg.string({
          description:
            'the hostname including subdomain, domain, and TLD, but excluding port'
        })
      },
      resolve: async (query, _, { hostname }) =>
        await prisma.shortLink.findMany({
          ...query,
          where: hostname != null ? { domain: { hostname } } : undefined,
          orderBy: {
            domain: { hostname: 'asc' },
            pathname: 'asc'
          }
        }),
      totalCount: async (_, { hostname }) =>
        await prisma.shortLink.count({
          where: hostname != null ? { domain: { hostname } } : undefined
        })
    })
}))

builder.mutationFields((t) => ({
  shortLinkCreate: t
    .withAuth({ isPublisher: true, isValidInterop: true })
    .prismaFieldWithInput({
      type: 'ShortLink',
      description: 'create a new short link',
      errors: {
        types: [ZodError, NotUniqueError]
      },
      nullable: false,
      input: {
        id: t.input.string({
          required: false,
          description:
            'the unique identifier for the short link (will generate if not given)'
        }),
        pathname: t.input.string({
          required: false,
          description:
            'short link path not including the leading slash (defaults to a random 11 character string that is URL friendly)'
        }),
        to: t.input.string({
          required: true,
          description:
            'the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to',
          validate: {
            url: true,
            refine: [
              async (to) => {
                let hostname: string
                try {
                  hostname = new URL(to).hostname
                } catch (e) {
                  return true
                }
                return (
                  (await prisma.shortLinkBlocklistDomain.findFirst({
                    where: { hostname }
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
        hostname: t.input.string({
          required: true,
          description:
            'the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to'
        }),
        service: t.input.field({
          type: Service,
          required: true,
          description: 'the service that created this short link'
        }),
        brightcoveId: t.input.string({
          required: false,
          description: 'brightcove video ID for video redirects'
        }),
        redirectType: t.input.field({
          type: RedirectType,
          required: false,
          description: 'type of video redirect (hls, dl, dh, s)'
        }),
        bitrate: t.input.int({
          required: false,
          description: 'bitrate of the video variant download'
        })
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
        {
          input: {
            id: inputId,
            pathname: inputPathname,
            to,
            hostname,
            service,
            brightcoveId,
            redirectType,
            bitrate
          }
        },
        context
      ) => {
        const pathname = inputPathname ?? nanoid(11)
        const id = inputId ?? uuidv4()
        try {
          return await prisma.shortLink.create({
            ...query,
            data: {
              id,
              pathname,
              to,
              domain: { connect: { hostname } },
              service,
              userId:
                context.type === 'authenticated' ? context.user.id : undefined,
              brightcoveId,
              redirectType,
              bitrate
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
  shortLinkUpdate: t
    .withAuth({ isPublisher: true, isValidInterop: true })
    .prismaFieldWithInput({
      type: 'ShortLink',
      description: 'update an existing short link',
      errors: {
        types: [ZodError, NotFoundError]
      },
      nullable: false,
      input: {
        id: t.input.string({ required: true }),
        to: t.input.string({
          required: true,
          description:
            'the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to',
          validate: {
            url: true,
            refine: [
              async (to) => {
                let hostname: string
                try {
                  hostname = new URL(to).hostname
                } catch (e) {
                  return true
                }
                return (
                  (await prisma.shortLinkBlocklistDomain.findFirst({
                    where: { hostname }
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
        brightcoveId: t.input.string({
          required: false,
          description: 'brightcove video ID for video redirects'
        }),
        redirectType: t.input.field({
          type: RedirectType,
          required: false,
          description: 'type of video redirect (hls, dl, dh, s)'
        }),
        bitrate: t.input.int({
          required: false,
          description: 'bitrate of the video variant download'
        })
      },
      resolve: async (
        query,
        _,
        { input: { id, to, brightcoveId, redirectType, bitrate } }
      ) => {
        try {
          return await prisma.shortLink.update({
            ...query,
            where: { id },
            data: {
              to,
              brightcoveId,
              redirectType,
              bitrate
            }
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
  shortLinkDelete: t
    .withAuth({ isPublisher: true, isValidInterop: true })
    .prismaField({
      type: 'ShortLink',
      description: 'delete an existing short link',
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
