import { builder } from '../builder'

export const TeamRef = builder.prismaObject('Team', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    publicTitle: t.exposeString('publicTitle', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    userTeams: t.relation('userTeams', { nullable: false }),
    customDomains: t.relation('customDomains', { nullable: false }),
    integrations: t.relation('integrations', { nullable: false }),
    qrCodes: t.relation('qrCodes', { nullable: false })
  })
})
