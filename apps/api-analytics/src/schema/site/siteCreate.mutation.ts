import ShortUniqueId from 'short-unique-id'

import { Prisma } from '.prisma/api-analytics-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

const SiteCreateInput = builder.inputType('SiteCreateInput', {
  fields: (t) => ({
    domain: t.string({ required: true }),
    goals: t.stringList()
  })
})

builder.mutationType({
  fields: (t) => ({
    siteCreate: t.prismaField({
      type: 'sites',
      authz: {
        rules: ['IsAuthenticated']
      },
      errors: {
        types: [Error]
      },
      args: {
        input: t.arg({ type: SiteCreateInput, required: true })
      },
      resolve: async (query, _parent, { input }, context) => {
        try {
          const uid = new ShortUniqueId({ length: 21 })
          return await prisma.sites.create({
            ...query,
            data: {
              domain: input.domain,
              timezone: 'Etc/UTC',
              inserted_at: new Date(),
              updated_at: new Date(),
              site_memberships: {
                create: {
                  users: {
                    connect: { id: context.currentUser.id }
                  },
                  role: 'owner',
                  inserted_at: new Date(),
                  updated_at: new Date()
                }
              },
              shared_links: {
                create: {
                  name: 'api-analytics',
                  inserted_at: new Date(),
                  updated_at: new Date(),
                  slug: uid.rnd()
                }
              },
              goals:
                input.goals != null
                  ? {
                      createMany: {
                        data: input.goals.map((eventName) => ({
                          event_name: eventName,
                          inserted_at: new Date(),
                          updated_at: new Date()
                        }))
                      }
                    }
                  : undefined
            }
          })
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002' &&
            error.message.includes(
              'Unique constraint failed on the fields: (`domain`)'
            )
          )
            throw new Error('domain already exists')

          throw error
        }
      }
    })
  })
})
