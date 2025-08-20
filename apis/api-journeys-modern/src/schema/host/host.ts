import { builder } from '../builder'

export const HostRef = builder.prismaObject('Host', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    title: t.exposeString('title'),
    location: t.exposeString('location', { nullable: true }),
    src1: t.exposeString('src1', { nullable: true }),
    src2: t.exposeString('src2', { nullable: true }),
    // Relations
    team: t.relation('team'),
    journeys: t.relation('journeys')
  })
})
