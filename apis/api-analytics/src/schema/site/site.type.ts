import { builder } from '../builder'

builder.prismaObject('sites', {
  name: 'Site',
  fields: (t) => ({
    id: t.string({
      nullable: false,
      resolve: ({ id }) => {
        return id.toString()
      }
    }),
    domain: t.exposeString('domain', { nullable: false }),
    memberships: t.relation('site_memberships', { nullable: false }),
    sharedLinks: t.relation('shared_links', { nullable: false }),
    goals: t.relation('goals', { nullable: false })
  })
})

builder.prismaObject('site_memberships', {
  name: 'SiteMembership',
  fields: (t) => ({
    id: t.string({
      nullable: false,
      resolve: ({ id }) => {
        return id.toString()
      }
    }),
    role: t.exposeString('role', { nullable: false })
  })
})

builder.prismaObject('shared_links', {
  name: 'SiteSharedLink',
  fields: (t) => ({
    id: t.string({
      nullable: false,
      resolve: ({ id }) => {
        return id.toString()
      }
    }),
    slug: t.exposeString('slug', { nullable: false })
  })
})

builder.prismaObject('goals', {
  name: 'SiteGoal',
  fields: (t) => ({
    id: t.string({
      nullable: false,
      resolve: ({ id }) => {
        return id.toString()
      }
    }),
    eventName: t.exposeString('event_name')
  })
})
