import { Prisma } from '.prisma/api-media-client'

import { builder } from '../builder'

builder.objectType(Prisma.PrismaClientKnownRequestError, {
  name: 'PrismaClientKnownRequestError',
  shareable: true,
  fields: (t) => ({
    message: t.exposeString('message'),
    code: t.exposeString('code')
  })
})
