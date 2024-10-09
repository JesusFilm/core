import { builder } from '../../builder'
import { Language } from '../../language'

builder.prismaObject('VideoStudyQuestion', {
  include: { order: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})