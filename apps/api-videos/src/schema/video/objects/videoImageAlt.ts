import { builder } from '../../builder'
import { Language } from '../../language'

builder.prismaObject('VideoImageAlt', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})
