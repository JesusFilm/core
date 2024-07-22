import { builder } from '../builder'

export const Language = builder
  .externalRef(
    'Language',
    builder.keyDirective(builder.selection<{ id: string }>('id'), false)
  )
  .implement({
    externalFields: (t) => ({
      id: t.id()
    })
  })
