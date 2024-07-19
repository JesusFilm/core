import { builder } from '../builder'
import { Language } from './language'

export const VideoDescription = builder.prismaObject('VideoDescription', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: (parent) => ({ id: parent.languageId })
    })
  })
})
