import { builder } from '../builder'

builder.objectType(Error, {
  name: 'Error',
  shareable: true,
  fields: (t) => ({
    message: t.exposeString('message', { nullable: false })
  })
})
