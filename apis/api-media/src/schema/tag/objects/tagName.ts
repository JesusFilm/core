import { builder } from '../../builder'
import { Language } from '../../language'

builder.prismaObject('TagName', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})
