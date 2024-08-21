import { builder } from '../builder'

builder.prismaObject('sites', {
  name: 'Site',
  fields: (t) => ({
    id: t.string({
      resolve: ({ id }) => {
        return id.toString()
      }
    }),
    domain: t.exposeString('domain'),
    memberships: t.relation('site_memberships'),
    sharedLinks: t.relation('shared_links'),
    goals: t.relation('goals')
  })
})

builder.prismaObject('site_memberships', {
  name: 'SiteMembership',
  fields: (t) => ({
    id: t.string({
      resolve: ({ id }) => {
        return id.toString()
      }
    }),
    role: t.exposeString('role')
  })
})

builder.prismaObject('shared_links', {
  name: 'SiteSharedLink',
  fields: (t) => ({
    id: t.string({
      resolve: ({ id }) => {
        return id.toString()
      }
    }),
    slug: t.exposeString('slug')
  })
})

builder.prismaObject('goals', {
  name: 'SiteGoal',
  fields: (t) => ({
    id: t.string({
      resolve: ({ id }) => {
        return id.toString()
      }
    }),
    eventName: t.exposeString('event_name', { nullable: true })
  })
})
