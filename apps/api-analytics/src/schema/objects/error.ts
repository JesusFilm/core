import { builder } from '../builder'

builder.objectType(Error, {
  name: 'Error',
  fields: (t) => ({
    message: t.exposeString('message', { nullable: false })
  })
})
