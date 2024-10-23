import { builder } from '../builder'

builder.prismaObject('Host', {
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeID('teamId'),
    title: t.exposeString('title'),
    location: t.exposeString('location', { nullable: true }),
    src1: t.exposeString('src1', { nullable: true }),
    src2: t.exposeString('src2', { nullable: true })
  })
})
