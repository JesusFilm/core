import { ZodError } from 'zod'

import { Prisma, prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { Service } from '../../enums/service'
import {
  ForeignKeyConstraintError,
  NotFoundError,
  NotUniqueError
} from '../../error'

import { ShortLinkDomainCheckRef } from './objects/shortLinkDomainCheck'
import {
  addVercelDomain,
  checkVercelDomain,
  removeVercelDomain
} from './shortLinkDomain.service'

builder.prismaObject('ShortLinkDomain', {
  description: 'A domain that can be used for short links',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    hostname: t.exposeString('hostname', { nullable: false }),
    apexName: t.exposeString('apexName', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'Date', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'Date', nullable: false }),
    services: t.expose('services', {
      type: [Service],
      nullable: false,
      description:
        'The services that are enabled for this domain, if empty then this domain can be used by all services'
    }),
    check: t.field({
      type: ShortLinkDomainCheckRef,
      authScopes: { isPublisher: true },
      nullable: false,
      description: 'check status of the domain',
      resolve: async ({ hostname }) => await checkVercelDomain(hostname)
    })
  })
})

builder.queryFields((t) => ({
  shortLinkDomains: t.withAuth({ isAuthenticated: true }).prismaConnection({
    type: 'ShortLinkDomain',
    cursor: 'id',
    description: 'List of short link domains that can be used for short links',
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
      }),
    totalCount: async (query, { service }) =>
      await prisma.shortLinkDomain.count({
        ...query,
        where:
          service != null
            ? {
                OR: [
                  { services: { hasEvery: [service] } },
                  { services: { isEmpty: true } }
                ]
              }
            : undefined
      })
  }),
  shortLinkDomain: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'ShortLinkDomain',
    description: 'Find a short link domain by id',
    errors: {
      types: [NotFoundError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) => {
      try {
        const domain = await prisma.shortLinkDomain.findFirstOrThrow({
          ...query,
          where: { id }
        })
        const check = await checkVercelDomain(domain.hostname)
        return { ...domain, check }
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
      description:
        'Create a new short link domain that can be used for short links (this domain must have a CNAME record pointing to the short link service)',
      errors: {
        types: [ZodError, NotUniqueError]
      },
      nullable: false,
      input: {
        hostname: t.input.string({
          required: true,
          description:
            'the hostname including subdomain, domain, and TLD, but excluding port',
          validate: [
            (value) => {
              try {
                return new URL(`https://${value}`).hostname === value
              } catch {
                return false
              }
            },
            'hostname must be valid'
          ]
        }),
        services: t.input.field({
          type: [Service],
          required: false,
          description:
            'the services that are enabled for this domain, if empty then this domain can be used by all services'
        })
      },
      resolve: async (query, _, { input: { hostname, services } }) => {
        return await prisma.$transaction(async (tx) => {
          try {
            const { apexName } = await addVercelDomain(hostname)
            const shortLinkDomain = await tx.shortLinkDomain.create({
              ...query,
              data: {
                hostname,
                apexName,
                services: services ?? []
              }
            })
            return shortLinkDomain
          } catch (e) {
            if (
              e instanceof Prisma.PrismaClientKnownRequestError &&
              e.code === 'P2002'
            ) {
              throw new NotUniqueError('short link domain already exists', [
                { path: ['input', 'hostname'], value: hostname }
              ])
            }
            await removeVercelDomain(hostname)
            throw e
          }
        })
      }
    }),
  shortLinkDomainUpdate: t
    .withAuth({ isPublisher: true })
    .prismaFieldWithInput({
      type: 'ShortLinkDomain',
      description: 'Update services that can use this short link domain',
      errors: {
        types: [NotFoundError]
      },
      nullable: false,
      input: {
        id: t.input.string({ required: true }),
        services: t.input.field({
          type: [Service],
          required: true,
          description:
            'the services that are enabled for this domain, if empty then this domain can be used by all services'
        })
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
    description:
      'delete an existing short link domain (all related short links must be deleted first)',
    errors: {
      types: [NotFoundError, ForeignKeyConstraintError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) => {
      return await prisma.$transaction(async (tx) => {
        try {
          const shortLinkDomain = await tx.shortLinkDomain.delete({
            ...query,
            where: { id }
          })
          await removeVercelDomain(shortLinkDomain.hostname)
          return shortLinkDomain
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2025') {
              // P2025: Record to delete not found
              throw new NotFoundError('short link domain not found', [
                {
                  path: ['id'],
                  value: id
                }
              ])
            }
            if (e.code === 'P2003') {
              // P2003: Record to delete is in use
              throw new ForeignKeyConstraintError(
                'short link domain still has associated short links',
                [
                  {
                    path: ['id'],
                    value: id
                  }
                ]
              )
            }
          }
          throw e
        }
      })
    }
  })
}))
