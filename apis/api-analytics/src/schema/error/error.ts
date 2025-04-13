import { builder } from '../builder'

export const ErrorInterface = builder
  .interfaceRef<Error>('BaseError')
  .implement({
    fields: (t) => ({
      message: t.exposeString('message')
    })
  })

builder.objectType(Error, {
  name: 'Error',
  shareable: true,
  interfaces: [ErrorInterface]
})
