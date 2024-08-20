import { builder } from '../builder'
import { Language } from '../language'

builder.prismaObject('Keyword', {
  fields: (t) => ({
    id: t.exposeID('id'),
    value: t.exposeString('value'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})
