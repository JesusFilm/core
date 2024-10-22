import { builder } from '../builder'

builder.prismaObject('VideoEdition', {
  fields: (t) => ({
    id: t.exposeID('id'),
    value: t.exposeString('name', { nullable: true })
  })
})
