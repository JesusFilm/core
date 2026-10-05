import { builder } from '../builder'

export const HostRef = builder.prismaObject('Host', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    teamId: t.exposeID('teamId', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    location: t.exposeString('location', { nullable: true }),
    src1: t.exposeString('src1', { nullable: true }),
    src2: t.exposeString('src2', { nullable: true })
  })
})
