import ShortUniqueId from 'short-unique-id'

import { Prisma, prisma } from '@core/prisma/analytics/client'

import { builder } from '../builder'

const SiteCreateInput = builder.inputType('SiteCreateInput', {
  fields: (t) => ({
    domain: t.string({ required: true }),
    goals: t.stringList(),
    disableSharedLinks: t.boolean({ required: false }),
    allowedEventProps: t.stringList({
      description:
        'Custom properties the dashboard shows; Plausible hides any not listed. Called again for a site the caller owns, missing ones are added and none removed.'
    })
  })
})

builder.mutationType({
  fields: (t) => ({
    siteCreate: t.withAuth({ isAuthenticated: true }).prismaField({
      type: 'sites',
      nullable: false,
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
              allowed_event_props: input.allowedEventProps ?? undefined,
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
              shared_links:
                input.disableSharedLinks === true
                  ? undefined
                  : {
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
          ) {
            const site = await prisma.sites.findUnique({
              ...query,
              include: {
                ...query.include,
                site_memberships: {
                  where: {
                    role: 'owner',
                    user_id: context.currentUser.id
                  }
                }
              },
              where: {
                domain: input.domain
              }
            })
            if (
              site?.site_memberships == null ||
              site.site_memberships.length === 0
            )
              throw new Error('domain already exists', { cause: error })

            // Plausible leaves the column NULL on a site that never set one.
            const allowedProps: string[] = site.allowed_event_props ?? []
            const missingProps = (input.allowedEventProps ?? []).filter(
              (prop) => !allowedProps.includes(prop)
            )
            if (missingProps.length === 0) return site

            return await prisma.sites.update({
              ...query,
              where: { id: site.id },
              data: {
                allowed_event_props: [...allowedProps, ...missingProps],
                updated_at: new Date()
              }
            })
          }

          throw error
        }
      }
    })
  })
})
