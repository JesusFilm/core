import { prisma } from '@core/prisma/analytics/client'

import { builder } from '../builder'

const SitesAllowEventPropsInput = builder.inputType(
  'SitesAllowEventPropsInput',
  {
    fields: (t) => ({
      domainPrefix: t.string({
        required: true,
        description:
          'Only sites whose domain starts with this, e.g. `api-journeys-campaign-`.'
      }),
      props: t.stringList({
        required: true,
        description: 'The custom properties every matching site should allow.'
      })
    })
  }
)

builder.mutationField('sitesAllowEventProps', (t) =>
  t.withAuth({ isAuthenticated: true }).int({
    nullable: false,
    description:
      'Adds `props` to the allowed custom properties of every site the caller owns under `domainPrefix` that lacks any of them, keeping the props each already allows. One query finds the sites to change, so a caller can keep a whole family of sites in step without visiting each. Returns how many sites changed.',
    args: {
      input: t.arg({ type: SitesAllowEventPropsInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      if (input.props.length === 0) return 0

      const sites = await prisma.sites.findMany({
        select: { id: true, allowed_event_props: true },
        where: {
          domain: { startsWith: input.domainPrefix },
          site_memberships: {
            some: { user_id: context.currentUser.id, role: 'owner' }
          },
          // Plausible leaves the column NULL on a site that never set one, and
          // a list filter's NOT never matches NULL, so NULL is its own case.
          OR: [
            { allowed_event_props: { equals: null } },
            { NOT: { allowed_event_props: { hasEvery: input.props } } }
          ]
        }
      })
      if (sites.length === 0) return 0

      const updatedAt = new Date()
      await prisma.$transaction(
        sites.map((site) => {
          const allowedProps: string[] = site.allowed_event_props ?? []
          return prisma.sites.update({
            where: { id: site.id },
            data: {
              allowed_event_props: [
                ...allowedProps,
                ...input.props.filter((prop) => !allowedProps.includes(prop))
              ],
              updated_at: updatedAt
            }
          })
        })
      )
      return sites.length
    }
  })
)
